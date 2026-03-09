"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, ImageIcon } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || "http://localhost:1996";

function getImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return API_BASE + url;
}

interface Category { id: number; name: string; level: number; children?: Category[]; }
interface Governorate { id: number; name: string; }
interface Listing {
  id: number; name: string; description: string | null;
  categoryId: number; governorateId: number;
  phone: string | null; whatsapp: string | null; email: string | null;
  website: string | null; address: string | null;
  isFeatured: boolean; isActive: boolean; viewCount: number;
  category: { id: number; name: string; parent?: { id: number; name: string; parent?: { id: number; name: string } } };
  governorate: { id: number; name: string };
  images: { imageUrl: string }[];
}

interface ListingForm {
  name: string; description: string; governorateId: string;
  phone: string; whatsapp: string; email: string; website: string; address: string;
  isFeatured: boolean; isActive: boolean;
}

const defaultForm: ListingForm = {
  name: "", description: "", governorateId: "",
  phone: "", whatsapp: "", email: "", website: "", address: "",
  isFeatured: false, isActive: true,
};

function getCategoryPath(cat: Listing["category"]): string {
  if (!cat) return "";
  const c = cat as any;
  if (c.parent?.parent) return `${c.parent.parent.name} › ${c.parent.name} › ${cat.name}`;
  if (c.parent) return `${c.parent.name} › ${cat.name}`;
  return cat.name;
}

export default function ListingsPage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const [filterGovId, setFilterGovId] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Listing | null>(null);
  const [form, setForm] = useState<ListingForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  // Cascading category selects
  const [sel1, setSel1] = useState("");
  const [sel2, setSel2] = useState("");
  const [sel3, setSel3] = useState("");

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesUploading, setImagesUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const level1Cats = categoryTree;
  const level2Cats = sel1 ? (categoryTree.find((c) => c.id === Number(sel1))?.children || []) : [];
  const level3Cats = sel2 ? (level2Cats.find((c) => c.id === Number(sel2))?.children || []) : [];
  const selectedCategoryId = sel3 || sel2 || sel1;

  const resetCascade = () => { setSel1(""); setSel2(""); setSel3(""); };
  const resetImages = () => {
    setImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (filterGovId !== "all") params.set("governorateId", filterGovId);
      if (filterActive !== "all") params.set("isActive", filterActive);
      if (filterFeatured !== "all") params.set("isFeatured", filterFeatured);
      const data: any = await api.get("/admin/listings?" + params.toString());
      setListings(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setLoading(false); }
  }, [page, search, filterGovId, filterActive, filterFeatured, toast]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  useEffect(() => {
    Promise.all([api.get("/admin/categories"), api.get("/admin/governorates")])
      .then(([cats, govs]: any) => {
        setCategoryTree(cats as Category[]);
        setGovernorates(govs as Governorate[]);
      })
      .catch(console.error);
  }, []);

  const setCascadeFromCategory = (cat: any) => {
    if (cat?.parent?.parent) {
      setSel1(String(cat.parent.parent.id));
      setSel2(String(cat.parent.id));
      setSel3(String(cat.id));
    } else if (cat?.parent) {
      setSel1(String(cat.parent.id));
      setSel2(String(cat.id));
      setSel3("");
    } else {
      setSel1(String(cat?.id || ""));
      setSel2("");
      setSel3("");
    }
  };

  const handleImagesUpload = async (files: FileList) => {
    if (files.length === 0) return;
    if (images.length + files.length > 10) {
      toast({ title: "خطأ", description: "الحد الأقصى 10 صور", variant: "destructive" });
      return;
    }
    setImagesUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("images", f));
      
      // Debug: Log the FormData being sent
      console.log("Sending FormData with images:");
      for (const pair of (formData as any).entries()) {
        console.log(pair[0], pair[1]);
      }
      
      const result: any = await api.post("/admin/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Handle both array and object responses
      const uploaded: { imageUrl: string }[] = Array.isArray(result) ? result : (result?.data ? (Array.isArray(result.data) ? result.data : [result.data]) : []);
      
      if (uploaded.length === 0) {
        toast({ title: "تحذير", description: "لم يتم رفع أي صور", variant: "destructive" });
        return;
      }
      
      const newUrls = uploaded.map((r) => r.imageUrl);
      const newPreviews = newUrls.map((u) => getImageUrl(u));
      setImages((prev) => [...prev, ...newUrls]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      toast({ title: "نجاح", description: `تم رفع ${uploaded.length} صورة بنجاح` });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "خطأ", description: error?.message || "فشل رفع الصور", variant: "destructive" });
    } finally {
      setImagesUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const openAdd = () => {
    setForm(defaultForm);
    resetCascade();
    resetImages();
    setAddOpen(true);
  };

  const openEdit = (l: Listing) => {
    setEditTarget(l);
    setForm({
      name: l.name, description: l.description || "",
      governorateId: String(l.governorateId), phone: l.phone || "",
      whatsapp: l.whatsapp || "", email: l.email || "",
      website: l.website || "", address: l.address || "",
      isFeatured: l.isFeatured, isActive: l.isActive,
    });
    setCascadeFromCategory(l.category);
    // Load existing images
    const existingUrls = l.images?.map((img) => img.imageUrl) || [];
    const existingPreviews = existingUrls.map((u) => getImageUrl(u));
    setImages(existingUrls);
    setImagePreviews(existingPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditOpen(true);
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    categoryId: Number(selectedCategoryId),
    governorateId: Number(form.governorateId),
    phone: form.phone.trim() || undefined,
    whatsapp: form.whatsapp.trim() || undefined,
    email: form.email.trim() || undefined,
    website: form.website.trim() || undefined,
    address: form.address.trim() || undefined,
    isFeatured: form.isFeatured,
    isActive: form.isActive,
    images: images.length > 0 ? images : undefined,
  });

  const handleAdd = async () => {
    if (!form.name.trim() || !selectedCategoryId || !form.governorateId) {
      toast({ title: "خطأ", description: "الاسم والقسم والمحافظة مطلوبة", variant: "destructive" });
      return;
    }
    if (images.length === 0) {
      toast({ title: "خطأ", description: "يجب رفع صورة واحدة على الأقل", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload();
      console.log("Sending payload:", payload); // Debug log
      await api.post("/admin/listings", payload);
      toast({ title: "تم", description: "تمت إضافة الإدخال بنجاح" });
      setAddOpen(false);
      fetchListings();
    } catch (error: any) {
      console.error("Error creating listing:", error); // Debug log
      const errorMsg = error?.response?.data?.errors?.[0]?.message || String(error) || "فشل إضافة الإدخال";
      toast({ title: "خطأ", description: errorMsg, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editTarget || !form.name.trim() || !selectedCategoryId || !form.governorateId) {
      toast({ title: "خطأ", description: "الاسم والقسم والمحافظة مطلوبة", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.put("/admin/listings/" + editTarget.id, buildPayload());
      toast({ title: "تم", description: "تم تعديل الإدخال بنجاح" });
      setEditOpen(false);
      fetchListings();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (l: Listing) => {
    if (!window.confirm("هل أنت متأكد من حذف \"" + l.name + "\"؟")) return;
    try {
      await api.delete("/admin/listings/" + l.id);
      toast({ title: "تم", description: "تم حذف الإدخال بنجاح" });
      fetchListings();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    }
  };

  const clearFilters = () => { setFilterGovId("all"); setFilterActive("all"); setFilterFeatured("all"); setSearch(""); setPage(1); };
  const hasFilters = filterGovId !== "all" || filterActive !== "all" || filterFeatured !== "all" || search;
  const totalPages = Math.ceil(total / limit);

  const formJsx = (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>الاسم *</Label>
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="اسم النشاط" />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>الوصف</Label>
          <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="وصف النشاط" rows={3} />
        </div>

        {/* Cascading category selects */}
        <div className="col-span-2 space-y-2">
          <Label>القسم *</Label>
          <Select value={sel1 || "none"} onValueChange={(v) => { setSel1(v === "none" ? "" : v); setSel2(""); setSel3(""); }}>
            <SelectTrigger><SelectValue placeholder="القسم الرئيسي" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">اختر القسم الرئيسي</SelectItem>
              {level1Cats.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {level2Cats.length > 0 && (
            <Select value={sel2 || "none"} onValueChange={(v) => { setSel2(v === "none" ? "" : v); setSel3(""); }}>
              <SelectTrigger className="border-r-4 border-r-blue-400"><SelectValue placeholder="القسم الفرعي" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">اختر القسم الفرعي</SelectItem>
                {level2Cats.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {level3Cats.length > 0 && (
            <Select value={sel3 || "none"} onValueChange={(v) => setSel3(v === "none" ? "" : v)}>
              <SelectTrigger className="border-r-4 border-r-violet-400"><SelectValue placeholder="التخصص" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">اختر التخصص</SelectItem>
                {level3Cats.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="col-span-2 space-y-2">
          <Label>المحافظة *</Label>
          <Select value={form.governorateId || "none"} onValueChange={(v) => setForm((p) => ({ ...p, governorateId: v === "none" ? "" : v }))}>
            <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">اختر المحافظة</SelectItem>
              {governorates.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Images upload */}
        <div className="col-span-2 space-y-2">
          <Label>الصور ({images.length}/10)</Label>
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group flex-shrink-0">
                <img src={src} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-xs py-0.5">
                    رئيسية
                  </div>
                )}
              </div>
            ))}
            {images.length < 10 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors flex-shrink-0"
              >
                {imagesUploading ? (
                  <span className="text-xs text-muted-foreground text-center px-1">جاري الرفع...</span>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">إضافة</span>
                  </>
                )}
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) handleImagesUpload(e.target.files); }}
          />
          <p className="text-xs text-muted-foreground">الصورة الأولى هي الصورة الرئيسية. الحد الأقصى 10 صور.</p>
        </div>

        <div className="space-y-2">
          <Label>الهاتف</Label>
          <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+963..." />
        </div>
        <div className="space-y-2">
          <Label>واتساب</Label>
          <Input value={form.whatsapp} onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))} placeholder="+963..." />
        </div>
        <div className="space-y-2">
          <Label>البريد الإلكتروني</Label>
          <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="example@domain.com" />
        </div>
        <div className="space-y-2">
          <Label>الموقع الإلكتروني</Label>
          <Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="https://..." />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>العنوان</Label>
          <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="العنوان التفصيلي" />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm((p) => ({ ...p, isFeatured: v }))} />
          <Label>مميّز</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.isActive} onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
          <Label>نشط</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">الإدخالات</CardTitle>
          <Button onClick={openAdd}>+ إضافة إدخال</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              placeholder="بحث عن إدخال..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-xs"
            />
            <Select value={filterGovId} onValueChange={(v) => { setFilterGovId(v); setPage(1); }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="المحافظة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المحافظات</SelectItem>
                {governorates.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterActive} onValueChange={(v) => { setFilterActive(v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="true">نشط</SelectItem>
                <SelectItem value="false">غير نشط</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterFeatured} onValueChange={(v) => { setFilterFeatured(v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="المميّز" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="true">مميّز فقط</SelectItem>
                <SelectItem value="false">غير مميّز</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                × مسح الفلاتر
              </Button>
            )}
          </div>

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right w-12">صورة</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">القسم</TableHead>
                    <TableHead className="text-right">المحافظة</TableHead>
                    <TableHead className="text-right">مميّز</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">مشاهدات</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">لا توجد إدخالات</TableCell>
                    </TableRow>
                  ) : (
                    listings.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>
                          {l.images?.[0] ? (
                            <img
                              src={getImageUrl(l.images[0].imageUrl)}
                              alt={l.name}
                              className="w-10 h-10 rounded object-cover border border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center border border-border">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px]">
                          {getCategoryPath(l.category)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{l.governorate?.name}</TableCell>
                        <TableCell>
                          {l.isFeatured && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300" variant="outline">مميّز ⭐</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={l.isActive ? "default" : "destructive"}>
                            {l.isActive ? "نشط" : "موقوف"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{l.viewCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(l)}>تعديل</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(l)}>حذف</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">إجمالي: {total} إدخال</span>
                {totalPages > 1 && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
                    <span className="text-sm py-1 px-2">{page} / {totalPages}</span>
                    <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader><DialogTitle>إضافة إدخال</DialogTitle></DialogHeader>
          {formJsx}
          <DialogFooter className="flex gap-2 justify-start">
            <Button onClick={handleAdd} disabled={submitting || imagesUploading}>{submitting ? "جاري الإضافة..." : "إضافة"}</Button>
            <Button variant="outline" onClick={() => setAddOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader><DialogTitle>تعديل الإدخال</DialogTitle></DialogHeader>
          {formJsx}
          <DialogFooter className="flex gap-2 justify-start">
            <Button onClick={handleEdit} disabled={submitting || imagesUploading}>{submitting ? "جاري الحفظ..." : "حفظ"}</Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
