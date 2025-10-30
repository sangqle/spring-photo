# Photo Platform

Welcome to the Photo Platform project! This application allows photographers to create a portfolio, upload their photos, and share them with clients. Additionally, it features a community feed where users can discover and interact with shared photos.

## Features

- **User Authentication**: Users can register and log in to manage their portfolios.
- **Portfolio Management**: Users can create and showcase their portfolios.
- **Photo Upload**: Users can upload photos to their portfolios.
- **Community Feed**: A feed where users can view and interact with photos shared by others.
- **Photo Sharing**: Users can share specific photos with clients via unique links.

## Project Structure

The project is organized as follows:

```
photo-platform
├── src
│   ├── app
│   │   ├── (auth)               # Authentication related pages
│   │   ├── (main)               # Main application pages
│   ├── components                # Reusable UI components
│   ├── lib                       # Utility functions and API clients
│   ├── hooks                     # Custom React hooks
│   └── types                     # TypeScript types
├── public                        # Static assets
├── package.json                  # NPM dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── next.config.ts                # Next.js configuration
```

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd photo-platform
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.