import { primaryCategories, categories } from "@/lib/categories";
import { authors } from "@/lib/authors";
import { ArticleForm } from "./ArticleForm";

export default function NewArticle() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-2xl font-medium">Nuevo artículo</h1>
      <div className="mt-6">
        <ArticleForm primaryCategories={primaryCategories} categories={categories} authors={authors} />
      </div>
    </div>
  );
}
