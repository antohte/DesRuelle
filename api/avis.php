<?php
// ============================================================
//  api/avis.php
//  GET  /api/avis.php              → avis approuvés
//  POST /api/avis.php              → soumettre un avis
//  POST /api/avis.php?action=ctrl  → contrôler un avis (responsable)
// ============================================================
require_once __DIR__ . '/config.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ── GET : avis approuvés ────────────────────────────────────
if ($method === 'GET') {
    try {
        $stmt = getDB()->prepare("
            SELECT id, prenom, nom_initial, location, service,
                   rating, texte, controle,
                   DATE_FORMAT(created_at, '%d/%m/%Y') AS date
            FROM avis
            WHERE statut = 'approuve'
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $data = array_map(fn($r) => array_merge($r, [
            'name'    => $r['prenom'] . ' ' . $r['nom_initial'] . '.',
            'rating'  => (int) $r['rating'],
            'controle'=> (bool) $r['controle'],
        ]), $rows);

        jsonResponse(['success' => true, 'data' => $data]);
    } catch (PDOException) {
        jsonError('Erreur serveur', 500);
    }
}

if ($method === 'POST') {

    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    // ── Contrôler un avis (responsable uniquement) ──────────
    if ($action === 'ctrl') {
        // En attendant l'auth JWT : on vérifie juste que l'id est fourni
        // À sécuriser avec un token de session quand l'auth sera en place
        $avisId       = (int)($body['avis_id']      ?? 0);
        $responsableId= (int)($body['responsable_id']?? 0);
        $controle     = (bool)($body['controle']     ?? false);

        if (!$avisId || !$responsableId) jsonError('Paramètres manquants');

        try {
            $pdo  = getDB();

            // Vérifier que l'user est bien responsable
            $chk = $pdo->prepare("SELECT role FROM users WHERE id = :id AND actif = 1");
            $chk->execute([':id' => $responsableId]);
            $user = $chk->fetch();
            if (!$user || $user['role'] !== 'responsable') {
                jsonError('Accès refusé — rôle responsable requis', 403);
            }

            $stmt = $pdo->prepare("
                UPDATE avis
                SET controle     = :controle,
                    controle_par = :par,
                    controle_at  = IF(:controle2 = 1, NOW(), NULL),
                    statut       = IF(:controle3 = 1, 'approuve', statut)
                WHERE id = :id
            ");
            $stmt->execute([
                ':controle'  => $controle ? 1 : 0,
                ':par'       => $controle ? $responsableId : null,
                ':controle2' => $controle ? 1 : 0,
                ':controle3' => $controle ? 1 : 0,
                ':id'        => $avisId,
            ]);

            jsonResponse(['success' => true, 'message' => 'Avis mis à jour']);
        } catch (PDOException) {
            jsonError('Erreur serveur', 500);
        }
    }

    // ── Soumettre un avis ───────────────────────────────────
    $required = ['prenom', 'nom', 'service', 'rating', 'texte'];
    foreach ($required as $f) {
        if (empty(trim((string)($body[$f] ?? '')))) jsonError("Champ manquant : $f");
    }

    $rating = (int)$body['rating'];
    if ($rating < 1 || $rating > 5) jsonError('Note invalide (1 à 5)');

    $nom      = trim($body['nom']);
    $initial  = strtoupper(mb_substr($nom, 0, 1));

    try {
        $stmt = getDB()->prepare("
            INSERT INTO avis
              (user_id, prenom, nom_initial, location, service, rating, texte, statut)
            VALUES
              (:uid, :prenom, :initial, :location, :service, :rating, :texte, 'en_attente')
        ");
        $stmt->execute([
            ':uid'      => !empty($body['user_id']) ? (int)$body['user_id'] : null,
            ':prenom'   => trim($body['prenom']),
            ':initial'  => $initial,
            ':location' => trim($body['location'] ?? ''),
            ':service'  => trim($body['service']),
            ':rating'   => $rating,
            ':texte'    => trim($body['texte']),
        ]);

        jsonResponse([
            'success' => true,
            'message' => 'Avis soumis. Il sera publié après modération.'
        ], 201);
    } catch (PDOException) {
        jsonError('Erreur serveur', 500);
    }
}

jsonError('Méthode non autorisée', 405);
