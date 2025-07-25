"""Initial database tables

Revision ID: 001
Revises: 
Create Date: 2024-01-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=True),
        sa.Column('last_name', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('is_staff', sa.Boolean(), nullable=True, default=False),
        sa.Column('is_superuser', sa.Boolean(), nullable=True, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Create application_types table
    op.create_table('application_types',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('required_documents', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('processing_time_days', sa.Integer(), nullable=True),
        sa.Column('fee', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_application_types_id'), 'application_types', ['id'], unique=False)
    op.create_index(op.f('ix_application_types_name'), 'application_types', ['name'], unique=True)

    # Create applications table
    op.create_table('applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('reference_number', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('application_type_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFO_REQUIRED', 'APPROVED', 'REJECTED', 'COMPLETED', name='applicationstatus'), nullable=False),
        sa.Column('priority', sa.Enum('LOW', 'NORMAL', 'HIGH', 'URGENT', name='applicationpriority'), nullable=True, default='NORMAL'),
        sa.Column('data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('documents', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('staff_notes', sa.Text(), nullable=True),
        sa.Column('assigned_to', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expected_completion', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['application_type_id'], ['application_types.id'], ),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_applications_id'), 'applications', ['id'], unique=False)
    op.create_index(op.f('ix_applications_reference_number'), 'applications', ['reference_number'], unique=True)
    op.create_index(op.f('ix_applications_status'), 'applications', ['status'], unique=False)
    op.create_index(op.f('ix_applications_user_id'), 'applications', ['user_id'], unique=False)

    # Create application_history table for tracking status changes
    op.create_table('application_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('application_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('old_status', sa.String(length=50), nullable=True),
        sa.Column('new_status', sa.String(length=50), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_application_history_application_id'), 'application_history', ['application_id'], unique=False)
    op.create_index(op.f('ix_application_history_id'), 'application_history', ['id'], unique=False)

    # Create notifications table
    op.create_table('notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('application_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.Enum('EMAIL', 'SMS', 'PUSH', 'IN_APP', name='notificationtype'), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=True, default=False),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')
    
    op.drop_index(op.f('ix_application_history_id'), table_name='application_history')
    op.drop_index(op.f('ix_application_history_application_id'), table_name='application_history')
    op.drop_table('application_history')
    
    op.drop_index(op.f('ix_applications_user_id'), table_name='applications')
    op.drop_index(op.f('ix_applications_status'), table_name='applications')
    op.drop_index(op.f('ix_applications_reference_number'), table_name='applications')
    op.drop_index(op.f('ix_applications_id'), table_name='applications')
    op.drop_table('applications')
    
    op.drop_index(op.f('ix_application_types_name'), table_name='application_types')
    op.drop_index(op.f('ix_application_types_id'), table_name='application_types')
    op.drop_table('application_types')
    
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS notificationtype')
    op.execute('DROP TYPE IF EXISTS applicationpriority')
    op.execute('DROP TYPE IF EXISTS applicationstatus')