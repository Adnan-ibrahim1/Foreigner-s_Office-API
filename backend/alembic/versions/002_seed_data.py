"""Add seed data for application types

Revision ID: 002
Revises: 001
Create Date: 2024-01-01 10:05:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Integer, Text, Boolean, DateTime, Numeric
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Define the application_types table structure for data insertion
    application_types = table('application_types',
        column('id', Integer),
        column('name', String),
        column('description', Text),
        column('required_documents', sa.ARRAY(String)),
        column('processing_time_days', Integer),
        column('fee', Numeric),
        column('is_active', Boolean),
    )

    # Insert seed data for common Leipzig administrative services
    op.bulk_insert(application_types, [
        {
            'id': 1,
            'name': 'Personalausweis beantragen',
            'description': 'Beantragung eines neuen Personalausweises',
            'required_documents': ['Geburtsurkunde', 'Lichtbild', 'Nachweis der deutschen Staatsangehörigkeit'],
            'processing_time_days': 14,
            'fee': 37.00,
            'is_active': True,
        },
        {
            'id': 2,
            'name': 'Reisepass beantragen',
            'description': 'Beantragung eines neuen Reisepasses',
            'required_documents': ['Personalausweis', 'Lichtbild', 'Geburtsurkunde'],
            'processing_time_days': 21,
            'fee': 60.00,
            'is_active': True,
        },
        {
            'id': 3,
            'name': 'Meldebescheinigung',
            'description': 'Ausstellung einer Meldebescheinigung',
            'required_documents': ['Personalausweis'],
            'processing_time_days': 1,
            'fee': 5.00,
            'is_active': True,
        },
        {
            'id': 4,
            'name': 'Führungszeugnis',
            'description': 'Beantragung eines Führungszeugnisses',
            'required_documents': ['Personalausweis', 'Verwendungszweck'],
            'processing_time_days': 10,
            'fee': 13.00,
            'is_active': True,
        },
        {
            'id': 5,
            'name': 'Anmeldung Wohnsitz',
            'description': 'Anmeldung bei Umzug nach Leipzig',
            'required_documents': ['Personalausweis', 'Wohnungsgeberbestätigung', 'Familienstand-Nachweis'],
            'processing_time_days': 1,
            'fee': 0.00,
            'is_active': True,
        },
        {
            'id': 6,
            'name': 'Abmeldung Wohnsitz',
            'description': 'Abmeldung bei Umzug aus Leipzig',
            'required_documents': ['Personalausweis'],
            'processing_time_days': 1,
            'fee': 0.00,
            'is_active': True,
        },
        {
            'id': 7,
            'name': 'Gewerbeanmeldung',
            'description': 'Anmeldung eines Gewerbes',
            'required_documents': ['Personalausweis', 'Handelsregisterauszug', 'Qualifikationsnachweis'],
            'processing_time_days': 3,
            'fee': 26.00,
            'is_active': True,
        },
    ])