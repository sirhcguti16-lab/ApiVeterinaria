import { config } from 'dotenv'

config()

export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_DATABASE = process.env.DB_DATABASE || 'base2026'
export const DB_USER = process.env.DB_USER || 'root'
export const DB_PASSWORD = process.env.DB_PASSWORD || ''
export const DB_PORT = process.env.DB_PORT || 3306
export const PORT = process.env.PORT || 3000

export const JWT_SECRET = process.env.JWT_SECRET || 'mi_super_secreto_jwt'
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
export const AUTH_USER = process.env.AUTH_USER || 'admin'
export const AUTH_PASSWORD = process.env.AUTH_PASSWORD || '123456'


