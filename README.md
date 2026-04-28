# 🎨 Digital Atelier - AI E-commerce Fashion Ecosystem

Digital Atelier is a cutting-edge SaaS platform that leverages advanced AI to revolutionize fashion e-commerce. It allows sellers to generate high-fidelity product images, lifestyle photography, and cinematic videos from simple garment uploads.

## 🚀 Key Features

- **AI-Driven Image Generation**: High-fidelity garment generation using SDXL-based workflows.
- **Virtual Try-On**: Seamlessly visualize garments on various human models.
- **Cinematic Video Workflows**: Generate walking and movement animations for fashion catalogs.
- **Centralized Security**: Production-ready environment variable validation using Zod.
- **Secure Authentication**: Robust authentication system powered by NextAuth.js and MongoDB.
- **Scalable Infrastructure**: Modern tech stack with Next.js, Mongoose, and advanced AI services (fal.ai, Google Gemini, RunComfy).

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, MongoDB (Mongoose)
- **Auth**: NextAuth.js
- **AI Services**:
  - [fal.ai](https://fal.ai) (Image Generation & Try-On)
  - [Google Gemini](https://deepmind.google/technologies/gemini/) (AI Director / Prompt Engineering)
  - [RunComfy](https://runcomfy.com) (ComfyUI Workflow Automation)
- **Validation**: Zod (Strict schema validation)

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (Atlas or local)
- API Keys for AI services (Gemini, FAL.ai, RunComfy)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd ecommerce-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_uri
   GEMINI_API_KEY=your_gemini_api_key
   FAL_KEY=your_fal_key
   RUNCOMFY_API_KEY=your_runcomfy_api_key
   RUNCOMFY_DEPLOYMENT_ID=your_runcomfy_deployment_id
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔒 Security

This project implements strict environment variable validation. All configuration is centralized in `src/config/env.ts` and validated using Zod at runtime. This prevents silent failures and ensures that all required secrets are present and correctly formatted.

## 🗺️ Roadmap

Detailed implementation steps and future phases can be found in [docs/ROADMAP.md](docs/ROADMAP.md).

---
Built with ❤️ for the future of fashion.
