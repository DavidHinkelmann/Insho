"""
Add gender and activity_level columns to users table

Revision ID: 2025_10_02_add_profile_fields
Revises: 2025_10_02_add_is_onboarded
Create Date: 2025-10-02
"""
from __future__ import annotations

from alembic import op

# revision identifiers, used by Alembic.
revision = '2025_10_02_add_profile_fields'
down_revision = '2025_10_02_add_is_onboarded'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add nullable profile fields if they do not exist
    op.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS gender VARCHAR(16)
        """
    )
    op.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS activity_level VARCHAR(32)
        """
    )


def downgrade() -> None:
    # Drop columns on downgrade if they exist
    op.execute(
        """
        ALTER TABLE users
        DROP COLUMN IF EXISTS activity_level
        """
    )
    op.execute(
        """
        ALTER TABLE users
        DROP COLUMN IF EXISTS gender
        """
    )
