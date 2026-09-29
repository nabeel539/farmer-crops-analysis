"""add_email_to_farmers

Revision ID: a3b7c9d1e2f4
Revises: 0810afd0c1c2
Create Date: 2026-09-27 15:50:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a3b7c9d1e2f4'
down_revision: Union[str, None] = '0810afd0c1c2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('farmers', sa.Column('email', sa.String(255), nullable=True))
    op.create_index('ix_farmers_email', 'farmers', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_farmers_email', table_name='farmers')
    op.drop_column('farmers', 'email')
