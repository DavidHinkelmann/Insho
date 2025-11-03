"""
Add is_onboarded column to the user's table

Revision ID: 2025_10_02_add_is_onboarded
Revises: 
Create Date: 2025-10-02
"""
from __future__ import annotations

from alembic import op

# revision identifiers, used by Alembic.
revision = '2025_10_02_add_is_onboarded'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Use raw SQL to be safe and idempotent for Postgres
    op.execute("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN NOT NULL DEFAULT FALSE
    """)


def downgrade() -> None:
    # Drop the column on downgrade if it exists
    op.execute("""
        ALTER TABLE users
        DROP COLUMN IF EXISTS is_onboarded
    """)
