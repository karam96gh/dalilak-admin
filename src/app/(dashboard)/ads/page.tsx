"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Ad {
  id: number;
  image: string;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface AdForm {
  imageUrl: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const defaultForm: AdForm = { imageUrl: "", linkUrl: "", order: 0, isActive: true, startDate: "", endDate: "" };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || "http://localhost:1996";

export default function AdsPage() {
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Ad | null>(null);
  const [form, setForm] = useState<AdForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const data: Ad[] = await api.get("/admin/ads");
      setAds(data);
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res: any = await api.post("/admin/upload/image", fd);
      const url: string = res?.imageUrl || res;
      setForm((p) => ({ ...p, imageUrl: url }));
      toast({ title: "تم", description: "تم رفع الصورة بنجاح" });
    } catch (error: any) {
      toast({ title: "خطأ", description: "فشل رفع الصورة: " + String(error), variant: "destructive" });
    } finally { setUploading(false); }
  };

  const openAdd = () => { setForm(defaultForm); setAddOpen(true); };
  const openEdit = (ad: Ad) => {
    setEditTarget(ad);
    setForm({
      imageUrl: ad.image,
      linkUrl: ad.linkUrl || "",
      order: ad.order,
      isActive: ad.isActive,
      startDate: ad.startDate ? ad.startDate.slice(0, 10) : "",
      endDate: ad.endDate ? ad.endDate.slice(0, 10) : "",
    });
    setEditOpen(true);
  };

  const buildPayload = (f: AdForm) => ({
    image: f.imageUrl,
    linkUrl: f.linkUrl.trim() || undefined,
    order: f.order,
    isActive: f.isActive,
    startDate: f.startDate ? new Date(f.startDate).toISOString() : undefined,
    endDate: f.endDate ? new Date(f.endDate + "T23:59:59").toISOString() : undefined,
  });

  const handleAdd = async () => {
    if (!form.imageUrl) {
      toast({ title: "خطأ", description: "الصورة مطلوبة", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/ads", buildPayload(form));
      toast({ title: "تم", description: "تمت إضافة الإعلان بنجاح" });
      setAddOpen(false);
      fetchAds();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editTarget || !form.imageUrl) {
      toast({ title: "خطأ", description: "الصورة مطلوبة", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.put("/admin/ads/" + editTarget.id, buildPayload(form));
      toast({ title: "تم", description: "تم تعديل الإعلان بنجاح" });
      setEditOpen(false);
      fetchAds();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (ad: Ad) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    try {
      await api.delete("/admin/ads/" + ad.id);
      toast({ title: "تم", description: "تم حذف الإعلان بنجاح" });
      fetchAds();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return API_BASE + url;
  };

  const FormBody = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>صورة الإعلان *</Label>
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "جاري الرفع..." : "رفع صورة"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }}
          />
          {form.imageUrl && (
            <span className="text-xs text-green-600 truncate max-w-xs">تم رفع الصورة</span>
          )}
        </div>
        {form.imageUrl && (
          <img src={getImageUrl(form.imageUrl)} alt="preview" className="mt-2 h-32 w-full object-cover rounded-lg border" />
        )}
      </div>
      <div className="space-y-2">
        <Label>رابط الإعلان</Label>
        <Input value={form.linkUrl} onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label>الترتيب</Label>
        <Input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>تاريخ البداية</Label>
          <Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>تاريخ الانتهاء</Label>
          <Input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
        </div>
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
          <CardTitle className="text-2xl">الإعلانات</CardTitle>
          <Button onClick={openAdd}>إضافة إعلان</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الصورة</TableHead>
                  <TableHead className="text-right">الرابط</TableHead>
                  <TableHead className="text-right">الترتيب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">لا توجد إعلانات</TableCell>
                  </TableRow>
                ) : (
                  ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        {ad.image && (
                          <img src={getImageUrl(ad.image)} alt="ad" className="h-14 w-24 object-cover rounded-md border" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {ad.linkUrl || "—"}
                      </TableCell>
                      <TableCell>{ad.order}</TableCell>
                      <TableCell>
                        <Badge variant={ad.isActive ? "default" : "destructive"}>
                          {ad.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ad.endDate ? new Date(ad.endDate).toLocaleDateString("ar-EG") : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(ad)}>تعديل</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(ad)}>حذف</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إضافة إعلان</DialogTitle></DialogHeader>
          <FormBody />
          <DialogFooter className="flex gap-2 justify-start">
            <Button onClick={handleAdd} disabled={submitting || uploading}>{submitting ? "جاري الإضافة..." : "إضافة"}</Button>
            <Button variant="outline" onClick={() => setAddOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعديل الإعلان</DialogTitle></DialogHeader>
          <FormBody />
          <DialogFooter className="flex gap-2 justify-start">
            <Button onClick={handleEdit} disabled={submitting || uploading}>{submitting ? "جاري الحفظ..." : "حفظ"}</Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
