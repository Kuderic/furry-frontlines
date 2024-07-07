# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory
WORKDIR /app

# Copy the requirements.txt file first to leverage Docker's cache
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . /app

# Expose port 8000 for the Uvicorn server
EXPOSE 8000

# Run the Uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
