from alembic import command
from alembic.config import Config

alembic_cfg = Config("alembic.ini")
command.revision(alembic_cfg, autogenerate=True, message="Create users table")
print("Migration created successfully.")