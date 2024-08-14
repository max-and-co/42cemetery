# Use the official Python image.
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install the PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy the requirements file
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create a startup script
RUN echo '#!/bin/sh\n\
alembic upgrade head\n\
uvicorn main:app --host 0.0.0.0 --port 8000 --reload\n\
' > /app/start.sh && chmod +x /app/start.sh

# Set the default command to execute the startup script
CMD ["/app/start.sh"]
