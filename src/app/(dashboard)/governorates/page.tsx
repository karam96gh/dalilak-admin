"use client";

import { useEffect, useState, useCallback } from "react";
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

interface Governorate {
  id: number;
  name: string;
  order: number;
  isActive: boolean;
  _count: { listings: number };
}
interface GovForm { name: string; order: number; isActive: boolean; }
const defaultForm: GovForm = { name: "", order: 0, isActive: true };

export default function GovernoratesPage() {
  const { toast } = useToast();
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Governorate | null>(null);
  const [form, setForm] = useState<GovForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchGovernorates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/governorates");
      setGovernorates(data as unknown as Governorate[]);
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchGovernorates(); }, [fetchGovernorates]);

  const openAdd = () => { setForm(defaultForm); setAddOpen(true); };
  const openEdit = (gov: Governorate) => {
    setEditTarget(gov);
    setForm({ name: gov.name, order: gov.order, isActive: gov.isActive });
    setEditOpen(true);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast({ title: "خطأ", description: "الاسم مطلوب", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/governorates", form);
      toast({ title: "تم", description: "تمت إضافة المحافظة بنجاح" });
      setAddOpen(false);
      fetchGovernorates();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editTarget || !form.name.trim()) {
      toast({ title: "خطأ", description: "الاسم مطلوب", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/admin/governorates/${editTarget.id}`, form);
      toast({ title: "تم", description: "تم تعديل المحافظة بنجاح" });
      setEditOpen(false);
      fetchGovernorates();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (gov: Governorate) => {
    if (!window.confirm(`هل أنت متأكد من حذف "${gov.name}"؟`)) return;
    try {
      await api.delete(`/admin/governorates/${gov.id}`);
      toast({ title: "تم", description: "تم حذف المحافظة بنجاح" });
      fetchGovernorates();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    }
  };

  const FormBody = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>الاسم *</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="اسم المحافظة"
        />
      </div>
      <div className="space-y-2">
        <Label>الترتيب</Label>
        <Input
          type="number"
          value={form.order}
          onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={form.isActive}
          onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
        />
        <Label>نشط</Label>
      </div>
    </div>
  );

  return (
    <div className="p-6" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">المحافظات</CardTitle>
          <Button onClick={openAdd}>إضافة محافظة</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الترتيب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">عدد الإدخالات</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {governorates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لا توجد محافظات
                    </TableCell>
                  </TableRow>
                ) : (
                  governorates.map((gov) => (
                    <TableRow key={gov.id}>
                      <TableCell className="font-medium">{gov.name}</TableCell>
                      <TableCell>{gov.order}</TableCell>
                      <TableCell>
                        <Badge variant={gov.isActive ? "default" : "destructive"}>
                          {gov.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>{gov._count.listings}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(gov)}>
                            تعديل
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(gov)}>
                            حذف
                          </Button>
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
          <DialogHeader><DialogTitle>إضافة محافظة</DialogTitle></DialogHeader>
          <FormBody />
          <DialogFooter className="flex gap-2 justify-start">
            <Button onClick={handleAdd} disabled={submitting}>
              {submitting ? "جاري الإضافة..." : "إضافة"}
            </Button>
            <Button variant="outline" onClick={() => setAddOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعديل المحافظة</DialogTitle></DialogHeader>
          <FormBody />
          <DialogFooter className="flex gap-2 justify-start">
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
