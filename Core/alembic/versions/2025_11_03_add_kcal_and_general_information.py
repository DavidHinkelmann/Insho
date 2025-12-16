"""
add kcal and general information

Revision ID: 2025_11_03_kcal_general_info
Revises: 2025_10_02_add_profile_fields
Create Date: 2025-11-03
"""
from __future__ import annotations

from alembic import op

# revision identifiers, used by Alembic.
revision = '2025_11_03_kcal_general_info'
down_revision = '2025_10_02_add_profile_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS age INTEGER,
        ADD COLUMN IF NOT EXISTS height INTEGER,
        ADD COLUMN IF NOT EXISTS weight INTEGER,
        ADD COLUMN IF NOT EXISTS kcal_goal INTEGER
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE users
        DROP COLUMN IF EXISTS kcal_goal,
        DROP COLUMN IF EXISTS weight,
        DROP COLUMN IF EXISTS height,
        DROP COLUMN IF EXISTS age
        """
    )