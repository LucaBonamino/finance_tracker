FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y python3 python3-pip build-essential && \
    apt-get clean

# Set the working directory to /app
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN python3 -m pip install --upgrade pip && \
    python3 -m pip install -r requirements.txt

# Copy the entire project
COPY . .

# Install your package
RUN pip install .

# Copy wait-for-it.sh into /app and make it executable
COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

# Change the working directory to src so that fin_pool is at the root of the module search path
WORKDIR /app/src

EXPOSE 8000
CMD ["python3", "-m", "uvicorn", "fin_pool.main:app", "--host", "0.0.0.0", "--port", "8000"]
