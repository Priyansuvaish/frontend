# Form Template Management System

A modern web application for managing form templates with a React frontend and Spring Boot backend integration.

## Features

- **Form Template Management**: Create, read, update, and delete form templates
- **JSON Schema Support**: Define form structures using JSON Schema format
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Role-based Access**: Head role required for template management operations
- **Real-time Validation**: JSON schema validation with helpful error messages

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **NextAuth.js** - Authentication system

### Backend Integration
- **Spring Boot** - Java backend framework
- **JPA/Hibernate** - Database ORM
- **Spring Security** - Role-based authorization
- **RESTful API** - HTTP endpoints for CRUD operations

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── Head/
│   │   │   └── page.tsx          # Main Head dashboard
│   │   └── api/
│   │       └── form-templates/   # API proxy routes
│   ├── components/
│   │   ├── FormTemplateCard.tsx  # Template display component
│   │   └── FormTemplateModal.tsx # Create/edit modal
│   ├── services/
│   │   └── formTemplateService.ts # API service layer
│   └── types/
│       └── form-template.ts      # TypeScript interfaces
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Java 17+ (for backend)
- Spring Boot backend running on `http://localhost:8080`

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   Create a `.env.local` file:
   ```env
   BACKEND_URL=http://localhost:8080
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:3000/Head](http://localhost:3000/Head)

### Backend Requirements

The frontend expects a Spring Boot backend with the following endpoints:

- `GET /api/form-templates` - List all templates
- `GET /api/form-templates/{id}` - Get template by ID
- `POST /api/form-templates` - Create new template (Head role required)
- `PUT /api/form-templates/{id}` - Update template (Head role required)
- `DELETE /api/form-templates/{id}` - Delete template (Head role required)

## Usage

### Creating a Form Template

1. Navigate to the Head dashboard
2. Click "Create Template"
3. Enter a title for your template
4. Define the JSON schema for your form structure
5. Click "Create" to save

### Example JSON Schema

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "Full Name",
      "minLength": 2
    },
    "email": {
      "type": "string",
      "title": "Email Address",
      "format": "email"
    },
    "department": {
      "type": "string",
      "title": "Department",
      "enum": ["Engineering", "Marketing", "Sales", "HR"]
    },
    "experience": {
      "type": "number",
      "title": "Years of Experience",
      "minimum": 0,
      "maximum": 50
    }
  },
  "required": ["name", "email", "department"]
}
```

### Managing Templates

- **View**: All templates are displayed in a responsive grid
- **Edit**: Click the "Edit" button to modify existing templates
- **Delete**: Click the "Delete" button to remove templates (with confirmation)

## API Integration

The frontend communicates with the backend through Next.js API routes that act as proxies:

- `/api/form-templates` - Handles GET and POST requests
- `/api/form-templates/[id]` - Handles GET, PUT, and DELETE for specific templates

## Security

- All template management operations require the "Head" role
- JSON schema validation prevents invalid data submission
- CSRF protection through Next.js built-in security features

## Development

### Adding New Features

1. **New Components**: Create reusable components in `src/components/`
2. **API Services**: Add service methods in `src/services/`
3. **Types**: Define TypeScript interfaces in `src/types/`
4. **API Routes**: Create proxy routes in `src/app/api/`

### Styling

The application uses Tailwind CSS for styling. Custom styles can be added to `src/app/globals.css`.

## Troubleshooting

### Common Issues

1. **Backend Connection Error**: Ensure the Spring Boot backend is running on the correct port
2. **CORS Issues**: The backend should allow requests from `http://localhost:3000`
3. **Authentication Errors**: Verify that the user has the "Head" role

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for type safety
3. Add proper error handling
4. Test all CRUD operations
5. Ensure responsive design works on all screen sizes
