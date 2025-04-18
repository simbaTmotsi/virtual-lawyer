# EasyLaw - Legal Practice Management Platform

EasyLaw is a comprehensive legal practice management solution designed to help law firms streamline their operations, manage clients and cases effectively, and leverage AI to enhance legal research and document preparation.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [CI/CD](#ci-cd)
- [Contributing](#contributing)
- [License](#license)

## Overview

EasyLaw provides a modern, integrated platform for legal professionals, offering tools for client management, case tracking, document automation, billing, and AI-powered legal research. The platform streamlines administrative tasks so legal professionals can focus more on serving their clients effectively.

## Architecture

![EasyLaw Architecture](https://placeholder.com/easylaw-architecture-diagram.png)

EasyLaw follows a microservice-oriented architecture:

- **Frontend**: React-based single-page application
- **Backend**: Django REST Framework for core business logic
- **API Layer**: FastAPI service for AI integrations and data processing
- **Database**: PostgreSQL for data storage
- **Cache**: Redis for session management and data caching

All components are containerized using Docker to ensure consistent development and deployment environments.

## Features

- **Authentication & User Management**: 
  - Secure login, registration, and password recovery
  - Role-based access control (Attorney, Paralegal, Administrator, Client)
  - Two-factor authentication support
  
- **Client Management**:
  - Comprehensive client profiles
  - Client portal access
  - Document sharing
  
- **Case Management**:
  - Case tracking and workflow
  - Task assignments
  - Deadline management
  - Document association
  
- **Document Management**:
  - Document creation and editing
  - Template library
  - Document versioning
  
- **AI-Powered Legal Research**:
  - Integration with LLMs (OpenAI, Google Gemini)
  - Legal precedent search
  - Document analysis
  
- **Billing & Payments**:
  - Time tracking
  - Invoice generation
  - Payment processing
  
- **Calendar & Scheduling**:
  - Appointment management
  - Court date tracking
  - Deadline notifications

- **Admin Portal**:
  - System configuration
  - User management
  - Analytics dashboard
  - LLM integration settings

## Technologies Used

### Frontend
- React 18
- React Router 6
- Tailwind CSS
- Headless UI
- Chart.js
- Formik & Yup

### Backend
- Django 4.2
- Django REST Framework
- JWT Authentication
- Celery (background tasks)

### API Layer
- FastAPI
- Uvicorn
- SQLAlchemy
- OpenAI & Google Generative AI integrations

### Infrastructure
- Docker & Docker Compose
- PostgreSQL
- Redis
- GitHub Actions (CI/CD)

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git
- Node.js (for local frontend development)
- Python 3.11 (for local backend development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/virtual-lawyer.git
   cd virtual-lawyer
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```

3. Access the applications:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - FastAPI: http://localhost:8001
   - Admin interface: http://localhost:8000/admin

### Configuration

1. Environment variables:
   - Create a `.env` file in both the `backend/` and `api/` directories based on the provided templates
   - Set your API keys for OpenAI and Google Gemini

2. Initial setup:
   - A default admin user is created on first run: `admin@example.com` (password is set during first run)
   - Use the admin interface to configure system settings

## Development

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### API Development

```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Documentation

- Django REST Framework API: http://localhost:8000/api/schema/swagger-ui/
- FastAPI Documentation: http://localhost:8001/docs

## Project Structure

```
virtual-lawyer/
├── frontend/              # React frontend application
├── backend/               # Django backend service
│   ├── easylaw/           # Main project settings
│   ├── accounts/          # User authentication and profiles
│   ├── clients/           # Client management
│   ├── cases/             # Case management
│   ├── documents/         # Document management
│   ├── research/          # Legal research features
│   ├── billing/           # Billing and payment processing
│   ├── calendar_app/      # Calendar and scheduling
│   └── admin_portal/      # Admin functionality
├── api/                   # FastAPI service for AI processing
├── .github/               # GitHub Actions CI/CD configuration
└── docker-compose.yml     # Docker Compose configuration
```

## Testing

Run backend tests:
```bash
cd backend
python manage.py test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## CI/CD

The project uses GitHub Actions for continuous integration and deployment:

- Automated testing for both frontend and backend
- Docker image building and pushing to registry
- Deployment to staging/production environments

See `.github/workflows/ci.yml` for the configuration.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2023 EasyLaw. All rights reserved.
