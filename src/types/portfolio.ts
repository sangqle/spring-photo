export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  items: PortfolioItem[];
}

export interface PortfolioItem {
  id: string;
  portfolioId: string;
  photoUrl: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}