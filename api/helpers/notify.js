import db from '../db.js'

/**
 * Crée une notification pour un utilisateur.
 * @param {number} userId
 * @param {string} type
 * @param {string} titre
 * @param {string} message
 * @param {string|null} lien
 */
export async function notify(userId, type, titre, message, lien = null) {
  await db.query(
    'INSERT INTO notifications (user_id, type, titre, message, lien) VALUES (?,?,?,?,?)',
    [userId, type, titre, message, lien]
  )
}
