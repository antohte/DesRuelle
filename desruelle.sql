-- ============================================================
--  CONCIERGERIE DESRUELLE — Base de données
--  Importer via phpMyAdmin : Importer > choisir ce fichier
-- ============================================================

CREATE DATABASE IF NOT EXISTS `desruelle`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `desruelle`;

-- ------------------------------------------------------------
--  Table : users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
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
CREATE TABLE IF NOT EXISTS `avis` (
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
  COMMENT='Avis clients — moderés et contrôlés par les responsables';

-- ------------------------------------------------------------
--  Table : contact_messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
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
--  Compte responsable par défaut
--  Email : admin@conciergerie-desruelle.fr
--  Mot de passe : Admin2025!  (à changer en production)
--  Hash bcrypt de 'password' pour les tests
-- ------------------------------------------------------------
INSERT INTO `users` (`prenom`, `nom`, `email`, `password`, `role`) VALUES (
  'Admin', 'Desruelle',
  'admin@conciergerie-desruelle.fr',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'responsable'
);
