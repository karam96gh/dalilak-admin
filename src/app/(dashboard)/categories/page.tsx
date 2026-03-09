"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronLeft, Upload, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || "http://localhost:1996";

function getImageUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return API_BASE + url;
}

interface Category {
  id: number;
  name: string;
  icon: string | null;
  image: string | null;
  parentId: number | null;
  level: number;
  order: number;
  isActive: boolean;
  _count: { children: number; listings: number };
  children?: Category[];
}

interface CatForm {
  name: string;
  icon: string;
  image: string;
  parentId: string;
  order: number;
  isActive: boolean;
}

const defaultForm: CatForm = { name: "", icon: "", image: "", parentId: "", order: 0, isActive: true };

const levelColors: Record<number, string> = {
  1: "bg-blue-100 text-blue-800 border-blue-200",
  2: "bg-violet-100 text-violet-800 border-violet-200",
  3: "bg-green-100 text-green-800 border-green-200",
};
const levelLabels: Record<number, string> = { 1: "رئيسي", 2: "فرعي", 3: "فرعي 2" };

function flattenForSelect(cats: Category[], depth = 0): Array<Category & { depth: number }> {
  const result: Array<Category & { depth: number }> = [];
  for (const cat of cats) {
    result.push({ ...cat, depth });
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenForSelect(cat.children, depth + 1));
    }
  }
  return result;
}

// ── CategoryRow moved OUTSIDE the page component to avoid hydration errors ──
interface CategoryRowProps {
  cat: Category;
  depth: number;
  expanded: Set<number>;
  onToggle: (id: number) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

function CategoryRow({ cat, depth, expanded, onToggle, onEdit, onDelete }: CategoryRowProps) {
  const isExpanded = expanded.has(cat.id);
  const hasChildren = cat.children && cat.children.length > 0;
  const indent = depth * 24;

  return (
    <>
      <tr className={`border-b transition-colors hover:bg-muted/40 ${depth === 0 ? "bg-slate-50" : depth === 1 ? "bg-white" : "bg-slate-50/50"}`}>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2" style={{ paddingRight: indent + "px" }}>
            {hasChildren ? (
              <button onClick={() => onToggle(cat.id)} className="p-0.5 rounded hover:bg-muted text-muted-foreground">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            {cat.image ? (
              <img src={getImageUrl(cat.image)} alt={cat.name} className="w-8 h-8 rounded object-cover border border-border" />
            ) : cat.icon ? (
              <span className="text-xl w-8 text-center">{cat.icon}</span>
            ) : null}
            <span className={`font-medium ${depth === 0 ? "text-slate-900" : depth === 1 ? "text-slate-700" : "text-slate-600 text-sm"}`}>
              {cat.name}
            </span>
          </div>
        </td>
        <td className="py-3 px-4">
          <Badge className={`text-xs ${levelColors[cat.level]}`} variant="outline">
            {levelLabels[cat.level]}
          </Badge>
        </td>
        <td className="py-3 px-4 text-sm text-muted-foreground">{cat.order}</td>
        <td className="py-3 px-4">
          <Badge variant={cat.isActive ? "default" : "destructive"} className="text-xs">
            {cat.isActive ? "نشط" : "موقوف"}
          </Badge>
        </td>
        <td className="py-3 px-4 text-sm text-muted-foreground">
          {cat._count.children > 0 ? <span className="text-blue-600 font-medium">{cat._count.children}</span> : "—"}
        </td>
        <td className="py-3 px-4 text-sm text-muted-foreground">
          {cat._count.listings > 0 ? <span className="text-green-600 font-medium">{cat._count.listings}</span> : "—"}
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(cat)}>تعديل</Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(cat)}
              disabled={cat._count.children > 0 || cat._count.listings > 0}
              title={cat._count.children > 0 ? "يحتوي على أقسام فرعية" : cat._count.listings > 0 ? "يحتوي على إدخالات" : ""}
            >
              حذف
            </Button>
          </div>
        </td>
      </tr>
      {hasChildren && isExpanded && cat.children!.map((child) => (
        <CategoryRow
          key={child.id}
          cat={child}
          depth={depth + 1}
          expanded={expanded}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function CategoriesPage() {
  const { toast } = useToast();
  const [tree, setTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<CatForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data: Category[] = await api.get("/admin/categories");
      setTree(data);
      setExpanded(new Set(data.map((c) => c.id)));
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const result: any = await api.post("/admin/upload/image", formData);
      const url: string = result?.imageUrl || result;
      setForm((p) => ({ ...p, image: url }));
      setImagePreview(getImageUrl(url));
      toast({ title: "تم", description: "تم رفع الصورة بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "فشل رفع الصورة", variant: "destructive" });
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setForm((p) => ({ ...p, image: "" }));
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const parentOptions = flattenForSelect(tree).filter((c) => c.level < 3);

  const openAdd = () => {
    setForm(defaultForm);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setAddOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      icon: cat.icon || "",
      image: cat.image || "",
      parentId: cat.parentId ? String(cat.parentId) : "",
      order: cat.order,
      isActive: cat.isActive,
    });
    setImagePreview(cat.image ? getImageUrl(cat.image) : "");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditOpen(true);
  };

  const buildPayload = (f: CatForm) => ({
    name: f.name.trim(),
    icon: f.icon.trim() || undefined,
    image: f.image || undefined,
    parentId: f.parentId ? Number(f.parentId) : undefined,
    order: f.order,
    isActive: f.isActive,
  });

  const handleAdd = async () => {
    if (!form.name.trim()) { toast({ title: "خطأ", description: "الاسم مطلوب", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await api.post("/admin/categories", buildPayload(form));
      toast({ title: "تم", description: "تمت إضافة القسم بنجاح" });
      setAddOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editTarget || !form.name.trim()) { toast({ title: "خطأ", description: "الاسم مطلوب", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await api.put("/admin/categories/" + editTarget.id, buildPayload(form));
      toast({ title: "تم", description: "تم تعديل القسم بنجاح" });
      setEditOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm("هل أنت متأكد من حذف \"" + cat.name + "\"؟")) return;
    try {
      await api.delete("/admin/categories/" + cat.id);
      toast({ title: "تم", description: "تم حذف القسم بنجاح" });
      fetchCategories();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    }
  };

  const formJsx = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>الاسم *</Label>
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="اسم القسم" />
      </div>
      <div className="space-y-2">
        <Label>الأيقونة (Emoji)</Label>
        <Input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder="مثال: 🏪" />
      </div>
      <div className="space-y-2">
        <Label>صورة القسم</Label>
        {imagePreview ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group">
            <img src={imagePreview} alt="صورة القسم" className="w-full h-full object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {imageUploading ? (
              <span className="text-xs text-muted-foreground">جاري الرفع...</span>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">رفع صورة</span>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
      </div>
      <div className="space-y-2">
        <Label>القسم الأب</Label>
        <Select value={form.parentId || "none"} onValueChange={(v) => setForm((p) => ({ ...p, parentId: v === "none" ? "" : v }))}>
          <SelectTrigger><SelectValue placeholder="بدون قسم أب (مستوى 1)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون قسم أب (مستوى 1)</SelectItem>
            {parentOptions.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {"— ".repeat(c.depth)}{c.icon ? c.icon + " " : ""}{c.name} (مستوى {c.level})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>الترتيب</Label>
        <Input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))} />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={form.isActive} onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
        <Label>نشط</Label>
      </div>
    </div>
  );

  return (
    <div className="p-6" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">الأقسام والفئات</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">اضغط على السهم لعرض الأقسام الفرعية</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setExpanded(new Set(tree.map((c) => c.id)))}>توسيع الكل</Button>
            <Button variant="outline" size="sm" onClick={() => setExpanded(new Set())}>طي الكل</Button>
            <Button onClick={openAdd}>+ إضافة قسم</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
          ) : tree.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">لا توجد أقسام</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الاسم</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">المستوى</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الترتيب</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الحالة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">أقسام فرعية</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">إدخالات</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {tree.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    depth={0}
                    expanded={expanded}
                    onToggle={toggleExpand}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إضافة قسم</DialogTitle></DialogHeader>
          {formJsx}
          <DialogFooter className="flex gap-2 justify-start">
            <Button onClick={handleAdd} disabled={submitting || imageUploading}>{submitting ? "جاري الإضافة..." : "إضافة"}</Button>
            <Button variant="outline" onClick={() => setAddOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعديل القسم</DialogTitle></DialogHeader>
          {formJsx}
          <DialogFooter className="flex gap-2 justify-start">
            <Button onClick={handleEdit} disabled={submitting || imageUploading}>{submitting ? "جاري الحفظ..." : "حفظ"}</Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
