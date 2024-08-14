import os
from alembic import command
from alembic.config import Config

# Create alembic directory if it doesn't exist
if not os.path.exists('alembic'):
    os.makedirs('alembic')
    os.makedirs('alembic/versions')

# Create alembic.ini if it doesn't exist
if not os.path.exists('alembic.ini'):
    alembic_cfg = Config()
    alembic_cfg.set_main_option('script_location', 'alembic')
    alembic_cfg.set_main_option('sqlalchemy.url', 'postgresql://user:password@db:5432/appdb')
    with open('alembic.ini', 'w') as f:
        alembic_cfg.write(f)

# Initialize alembic only if it hasn't been initialized yet
if not os.path.exists('alembic/env.py'):
    alembic_cfg = Config("alembic.ini")
    command.init(alembic_cfg, 'alembic')
    print("Alembic initialized.")
else:
    print("Alembic already initialized. Skipping initialization.")

print("Alembic setup complete.")