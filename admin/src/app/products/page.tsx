'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Package,
  FolderOpen,
  Loader2,
  Upload,
  ImageIcon,
} from 'lucide-react';
import { cn, formatDate, formatNumber } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  categoryId: string;
  color: string;
  description: string;
  features: string[];
  tryOnCount: number;
  isTrending: boolean;
  imageUrl: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

const EMPTY_FORM: Omit<Product, 'id' | 'tryOnCount' | 'imageUrl' | 'createdAt'> = {
  name: '',
  categoryId: 'outfits',
  color: '#6366f1',
  description: '',
  features: [],
  isTrending: false,
};

function CategoryBadge({ categoryId, categories }: { categoryId: string; categories: Category[] }) {
  const colorMap: Record<string, string> = {
    outfits: 'bg-violet-50 text-violet-700 ring-violet-200',
    bags: 'bg-amber-50 text-amber-700 ring-amber-200',
    shoes: 'bg-blue-50 text-blue-700 ring-blue-200',
    glasses: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    watches: 'bg-slate-50 text-slate-700 ring-slate-200',
    accessories: 'bg-pink-50 text-pink-700 ring-pink-200',
  };
  const label = categories.find((c) => c.id === categoryId)?.name ?? categoryId;
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', colorMap[categoryId] ?? 'bg-gray-50 text-gray-700 ring-gray-200')}>
      {label}
    </span>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', checked ? 'bg-indigo-600' : 'bg-gray-200')}
    >
      <span className={cn('pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform', checked ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [featuresInput, setFeaturesInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        if (Array.isArray(prods)) setProducts(prods);
        if (Array.isArray(cats)) setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  function openAddModal() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFeaturesInput('');
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setForm({ name: product.name, categoryId: product.categoryId, color: product.color, description: product.description, features: product.features, isTrending: product.isTrending });
    setFeaturesInput(product.features.join(', '));
    setImageFile(null);
    setImagePreview(product.imageUrl || '');
    setModalOpen(true);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  }

  async function handleSave() {
    const features = featuresInput.split(',').map((f) => f.trim()).filter(Boolean);
    setSaving(true);
    try {
      let imageUrl = editingProduct?.imageUrl ?? '';

      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadImage(imageFile);
        setUploading(false);
      }

      if (editingProduct) {
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...form, features, imageUrl }),
        });
        setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? { ...p, ...form, features, imageUrl } : p));
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, features, imageUrl }),
        });
        const result = await res.json();
        if (result.id) {
          setProducts((prev) => [{ id: result.id, ...form, features, tryOnCount: 0, imageUrl, createdAt: new Date().toISOString() }, ...prev]);
        }
      }
    } catch (err) {
      console.error('Save failed:', err);
      setUploading(false);
    } finally {
      setSaving(false);
      setModalOpen(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setDeleteConfirm(null);
  }

  async function toggleTrending(id: string) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newVal = !product.isTrending;
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isTrending: newVal } : p));
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isTrending: newVal }),
      });
    } catch (err) {
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isTrending: !newVal } : p));
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your TryOn AI product catalog (live from Firestore)</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 active:bg-indigo-800">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} product{filtered.length !== 1 && 's'}</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Product</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Category</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Try-Ons</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600">Trending</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Date Added</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" /> No products found
                  </td>
                </tr>
              )}
              {filtered.map((product) => (
                <tr key={product.id} className="group cursor-pointer transition-colors hover:bg-gray-50/80" onClick={() => openEditModal(product)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-9 w-9 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-gray-200" />
                      ) : (
                        <div className="h-9 w-9 shrink-0 rounded-lg shadow-sm ring-1 ring-gray-200" style={{ backgroundColor: product.color }} />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{product.name}</p>
                        <p className="truncate text-xs text-gray-500 max-w-[260px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><CategoryBadge categoryId={product.categoryId} categories={categories} /></td>
                  <td className="px-6 py-4 text-right font-medium tabular-nums text-gray-700">{formatNumber(product.tryOnCount)}</td>
                  <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <Toggle checked={product.isTrending} onChange={() => toggleTrending(product.id)} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(product.createdAt)}</td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => openEditModal(product)} className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {deleteConfirm === product.id ? (
                        <button onClick={() => handleDelete(product.id)} className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700">Confirm</button>
                      ) : (
                        <button onClick={() => setDeleteConfirm(product.id)} className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <button onClick={() => setCategoriesOpen(!categoriesOpen)} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-gray-400" />
            <span className="font-semibold text-gray-900">Category Management</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{categories.length}</span>
          </div>
          {categoriesOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </button>
        {categoriesOpen && (
          <div className="border-t border-gray-200 px-6 py-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span key={cat.id} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700">
                  {cat.name} <span className="text-xs text-gray-400">({cat.id})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Product name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Brief product description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300" />
                    <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="block flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Features <span className="font-normal text-gray-400">(comma separated)</span></label>
                <input type="text" value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. Waterproof, Lightweight, Durable" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Product Image</label>
                <div className="flex items-start gap-4">
                  {imagePreview ? (
                    <div className="relative group">
                      <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover ring-1 ring-gray-200" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-indigo-400 hover:bg-indigo-50">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                      <span className="mt-1 text-xs text-gray-500">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                  )}
                  {imagePreview && (
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
                      <Upload className="h-3.5 w-3.5" /> Change
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Mark as Trending</p>
                  <p className="text-xs text-gray-500">Show in the trending section of the app</p>
                </div>
                <Toggle checked={form.isTrending} onChange={(v) => setForm({ ...form, isTrending: v })} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> {uploading ? 'Uploading image…' : 'Saving…'}</> : editingProduct ? <><Pencil className="h-4 w-4" /> Update Product</> : <><Plus className="h-4 w-4" /> Add Product</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
