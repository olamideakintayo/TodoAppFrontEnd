# TaskFlow - Modern Todo Application

A full-featured todo application with reminders, built with Next.js and integrated with a Spring Boot backend.

## Features

- **Authentication**: Secure login and registration with JWT tokens
- **Todo Management**: Create, update, delete, and complete tasks
- **Reminders**: Set email, push, or combined notifications for tasks
- **Due Dates**: Track task deadlines with visual indicators
- **User Profile**: View account information and settings
- **Dark Theme**: Professional dark mode interface

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **State Management**: React Context API
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (Spring Boot application)

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_API_BASE_URL=inhttp://localhost:8080
\`\`\`

4. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

The application connects to the following backend endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Todos
- `GET /api/todos/user/{userId}` - Get user's todos
- `POST /api/todos/{userId}` - Create todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo

### Reminders
- `GET /api/reminders/todo/{todoId}` - Get todo reminders
- `POST /api/reminders/{todoId}` - Create reminder
- `PUT /api/reminders/{id}` - Update reminder
- `DELETE /api/reminders/{id}` - Delete reminder

### Users
- `GET /api/users/{id}` - Get user details

## Project Structure

\`\`\`
├── app/
│   ├── dashboard/          # Main todo dashboard
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── profile/            # User profile
│   └── todos/[id]/         # Todo detail with reminders
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── todo-card.tsx       # Todo card component
├── lib/
│   ├── api.ts              # API client
│   ├── auth-context.tsx    # Authentication context
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
\`\`\`

## Features in Detail

### Dashboard
- View all tasks organized by status (active/completed)
- Quick stats showing total, active, and completed tasks
- Create new tasks with title, description, and due date
- Toggle task completion status
- Delete tasks
- Navigate to reminder management

### Reminders
- Set multiple reminders per task
- Choose notification type: Email, Push, or Both
- View reminder status (triggered/pending)
- Delete reminders

### Profile
- View account information
- Check account status
- See API configuration

## Design

The application features a dark, professional theme inspired by modern developer tools:
- Dark background with subtle borders
- Card-based layouts for content organization
- Green accents for success states
- Monospace fonts for technical elements
- Responsive design for all screen sizes

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL (default: http://localhost:8080)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the `NEXT_PUBLIC_API_BASE_URL` environment variable
4. Deploy

## License

MIT
