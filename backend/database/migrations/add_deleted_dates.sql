-- Migration: Add deleted_dates column to tasks table
-- This column tracks dates when a recurring task was hidden/deleted
-- It follows the same pattern as completed_dates for per-instance tracking

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_dates TEXT[] DEFAULT '{}';
