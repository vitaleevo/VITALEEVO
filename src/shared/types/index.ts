
export enum View {
  Home = 'home',
  Services = 'services',
  Portfolio = 'portfolio',
  About = 'about',
  Contact = 'Contact',
  Store = 'Store',
  Careers = 'careers',
  Blog = 'blog'
}

export interface JobOpening {
  id: string;
  title: string;
  category: 'Design' | 'Technology' | 'Marketing';
  type: string;
  location: string;
  isNew?: boolean;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  tags: string[];
  image: string;
}
