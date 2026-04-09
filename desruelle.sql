-- ============================================================
--  CONCIERGERIE DESRUELLE — Base de données complète
--  Importer via phpMyAdmin : Importer > choisir ce fichier
-- ============================================================

CREATE DATABASE IF NOT EXISTS `desruellebis`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `desruellebis`;

-- ------------------------------------------------------------
--  Suppression des tables existantes (ordre inverse des FK)
-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `disponibilites_techniciens`;
DROP TABLE IF EXISTS `feedbacks`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `demandes_modification`;
DROP TABLE IF EXISTS `intervention_techniciens`;
DROP TABLE IF EXISTS `interventions`;
DROP TABLE IF EXISTS `devis`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `avis`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
--  Table : users
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id`           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `prenom`       VARCHAR(100)    NOT NULL,
  `nom`          VARCHAR(100)    NOT NULL,
  `email`        VARCHAR(255)    NOT NULL UNIQUE,
  `password`     VARCHAR(255)    NOT NULL COMMENT 'Hash bcrypt',
  `telephone`    VARCHAR(30)              DEFAULT NULL,
  `adresse`      VARCHAR(255)             DEFAULT NULL,
  `role`         ENUM('client','technicien','responsable')
                                 NOT NULL DEFAULT 'client',
  `actif`        TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_role`  (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Utilisateurs : clients, techniciens, responsables';

-- ------------------------------------------------------------
--  Table : avis
-- ------------------------------------------------------------
CREATE TABLE `avis` (
  `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`      INT UNSIGNED           DEFAULT NULL COMMENT 'Auteur lié à users',
  `prenom`       VARCHAR(100)  NOT NULL COMMENT 'Affiché publiquement',
  `nom_initial`  CHAR(1)       NOT NULL COMMENT 'Ex: M.',
  `location`     VARCHAR(150)  NOT NULL,
  `service`      VARCHAR(255)  NOT NULL,
  `rating`       TINYINT       NOT NULL COMMENT '1 à 5',
  `texte`        TEXT          NOT NULL,
  `controle`     TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1 = validé par responsable',
  `controle_par` INT UNSIGNED           DEFAULT NULL,
  `controle_at`  DATETIME               DEFAULT NULL,
  `statut`       ENUM('en_attente','approuve','refuse') NOT NULL DEFAULT 'en_attente',
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_statut`   (`statut`),
  INDEX `idx_controle` (`controle`),
  INDEX `idx_user`     (`user_id`),
  CONSTRAINT `fk_avis_user`
    FOREIGN KEY (`user_id`)      REFERENCES `users`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_avis_controle`
    FOREIGN KEY (`controle_par`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Avis clients — modérés par les responsables';

-- ------------------------------------------------------------
--  Table : contact_messages
-- ------------------------------------------------------------
CREATE TABLE `contact_messages` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `nom`         VARCHAR(100)  NOT NULL,
  `prenom`      VARCHAR(100)  NOT NULL,
  `email`       VARCHAR(255)  NOT NULL,
  `telephone`   VARCHAR(30)   NOT NULL,
  `adresse`     VARCHAR(255)  NOT NULL,
  `objet`       VARCHAR(255)  NOT NULL,
  `message`     TEXT          NOT NULL,
  `lu`          TINYINT(1)    NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_lu` (`lu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Messages du formulaire de contact';

-- ------------------------------------------------------------
--  Table : devis
-- ------------------------------------------------------------
CREATE TABLE `devis` (
  `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `client_id`         INT UNSIGNED    NOT NULL,
  `type_service`      VARCHAR(255)    NOT NULL,
  `description`       TEXT            NOT NULL,
  `adresse_service`   VARCHAR(255)    NOT NULL,
  `recurrence`        ENUM('unique','hebdomadaire','mensuel','personnalise') NOT NULL DEFAULT 'unique',
  `recurrence_detail` VARCHAR(255)             DEFAULT NULL,
  `statut`            ENUM('en_attente','valide','refuse','accepte_client','refuse_client','annule') NOT NULL DEFAULT 'en_attente',
  `prix`              DECIMAL(10,2)            DEFAULT NULL,
  `heures_estimees`   DECIMAL(5,2)             DEFAULT NULL,
  `nb_techniciens`    TINYINT UNSIGNED         DEFAULT NULL,
  `note_responsable`  TEXT                     DEFAULT NULL,
  `valide_par`        INT UNSIGNED             DEFAULT NULL,
  `valide_at`         DATETIME                 DEFAULT NULL,
  `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_client` (`client_id`),
  INDEX `idx_statut` (`statut`),
  CONSTRAINT `fk_devis_client`
    FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_devis_resp`
    FOREIGN KEY (`valide_par`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Devis soumis par les clients';

-- ------------------------------------------------------------
--  Table : interventions
-- ------------------------------------------------------------
CREATE TABLE `interventions` (
  `id`                       INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `devis_id`                 INT UNSIGNED    NOT NULL,
  `client_id`                INT UNSIGNED    NOT NULL,
  `date_debut`               DATETIME        NOT NULL,
  `date_fin`                 DATETIME        NOT NULL,
  `statut`                   ENUM('planifie','en_cours','termine','annule') NOT NULL DEFAULT 'planifie',
  `stripe_payment_intent_id` VARCHAR(255)             DEFAULT NULL,
  `stripe_statut`            ENUM('en_attente','capture','rembourse') NOT NULL DEFAULT 'en_attente',
  `montant`                  DECIMAL(10,2)   NOT NULL,
  `progression`              TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0-100',
  `note_interne`             TEXT                     DEFAULT NULL,
  `created_at`               DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`               DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_devis`   (`devis_id`),
  INDEX `idx_client`  (`client_id`),
  INDEX `idx_statut`  (`statut`),
  INDEX `idx_date`    (`date_debut`),
  CONSTRAINT `fk_interv_devis`
    FOREIGN KEY (`devis_id`)  REFERENCES `devis`(`id`)  ON DELETE CASCADE,
  CONSTRAINT `fk_interv_client`
    FOREIGN KEY (`client_id`) REFERENCES `users`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Interventions planifiées et payées';

-- ------------------------------------------------------------
--  Table : intervention_techniciens
-- ------------------------------------------------------------
CREATE TABLE `intervention_techniciens` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `intervention_id` INT UNSIGNED NOT NULL,
  `technicien_id`   INT UNSIGNED NOT NULL,
  `statut`          ENUM('assigne','confirme','remplace','annule') NOT NULL DEFAULT 'assigne',
  `remplace_par`    INT UNSIGNED DEFAULT NULL,
  `assigned_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_interv_tech` (`intervention_id`, `technicien_id`),
  INDEX `idx_tech` (`technicien_id`),
  CONSTRAINT `fk_it_intervention`
    FOREIGN KEY (`intervention_id`) REFERENCES `interventions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_it_technicien`
    FOREIGN KEY (`technicien_id`)   REFERENCES `users`(`id`)          ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Techniciens assignés à chaque intervention';

-- ------------------------------------------------------------
--  Table : demandes_modification
-- ------------------------------------------------------------
CREATE TABLE `demandes_modification` (
  `id`                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `intervention_id`     INT UNSIGNED NOT NULL,
  `demandeur_id`        INT UNSIGNED NOT NULL,
  `type`                ENUM('annulation','modification') NOT NULL,
  `raison`              TEXT         NOT NULL,
  `nouvelle_date_debut` DATETIME     DEFAULT NULL,
  `nouvelle_date_fin`   DATETIME     DEFAULT NULL,
  `statut`              ENUM('en_attente','approuve','refuse') NOT NULL DEFAULT 'en_attente',
  `traite_par`          INT UNSIGNED DEFAULT NULL,
  `traite_at`           DATETIME     DEFAULT NULL,
  `remboursement`       TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_intervention` (`intervention_id`),
  INDEX `idx_demandeur`    (`demandeur_id`),
  INDEX `idx_statut`       (`statut`),
  CONSTRAINT `fk_dm_intervention`
    FOREIGN KEY (`intervention_id`) REFERENCES `interventions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dm_demandeur`
    FOREIGN KEY (`demandeur_id`)    REFERENCES `users`(`id`)          ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Demandes d\'annulation ou modification d\'intervention';

-- ------------------------------------------------------------
--  Table : notifications
-- ------------------------------------------------------------
CREATE TABLE `notifications` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED NOT NULL,
  `type`       VARCHAR(100) NOT NULL,
  `titre`      VARCHAR(255) NOT NULL,
  `message`    TEXT         NOT NULL,
  `lien`       VARCHAR(255)          DEFAULT NULL,
  `lu`         TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_lu` (`user_id`, `lu`),
  CONSTRAINT `fk_notif_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Notifications utilisateurs';

-- ------------------------------------------------------------
--  Table : feedbacks
-- ------------------------------------------------------------
CREATE TABLE `feedbacks` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `intervention_id` INT UNSIGNED NOT NULL,
  `auteur_id`       INT UNSIGNED NOT NULL,
  `cible_id`        INT UNSIGNED DEFAULT NULL,
  `type`            ENUM('client_sur_service','technicien_sur_client','technicien_sur_service') NOT NULL,
  `rating`          TINYINT      NOT NULL,
  `commentaire`     TEXT         NOT NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_feedback` (`intervention_id`, `auteur_id`, `type`),
  INDEX `idx_intervention` (`intervention_id`),
  INDEX `idx_auteur`       (`auteur_id`),
  CONSTRAINT `fk_fb_intervention`
    FOREIGN KEY (`intervention_id`) REFERENCES `interventions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fb_auteur`
    FOREIGN KEY (`auteur_id`)       REFERENCES `users`(`id`)          ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Retours clients et techniciens après intervention';

-- ------------------------------------------------------------
--  Table : disponibilites_techniciens
-- ------------------------------------------------------------
CREATE TABLE `disponibilites_techniciens` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `technicien_id` INT UNSIGNED NOT NULL,
  `date_debut`    DATETIME     NOT NULL,
  `date_fin`      DATETIME     NOT NULL,
  `type`          ENUM('conge','indisponible','autre') NOT NULL DEFAULT 'indisponible',
  `note`          VARCHAR(255)          DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_tech_date` (`technicien_id`, `date_debut`),
  CONSTRAINT `fk_dispo_tech`
    FOREIGN KEY (`technicien_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Indisponibilités déclarées par les techniciens';

-- ------------------------------------------------------------
--  Compte responsable par défaut
--  Email : admin@conciergerie-desruelle.fr
--  Mot de passe : password (hash bcrypt — à changer en production)
-- ------------------------------------------------------------
INSERT IGNORE INTO `users` (`prenom`, `nom`, `email`, `password`, `role`) VALUES (
  'Admin', 'Desruelle',
  'admin@conciergerie-desruelle.fr',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'responsable'
);
