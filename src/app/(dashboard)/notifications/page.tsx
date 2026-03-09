"use client";

import { useEffect, useState, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  title: string;
  body: string;
  isActive: boolean;
  createdAt: string;
}

interface NotifForm {
  title: string;
  body: string;
  isActive: boolean;
}

const defaultForm: NotifForm = { title: "", body: "", isActive: true };

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Notification | null>(null);
  const [form, setForm] = useState<NotifForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await api.get("/admin/notifications?page=" + page + "&limit=" + limit);
      setNotifications(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setLoading(false); }
  }, [page, toast]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const openAdd = () => { setForm(defaultForm); setAddOpen(true); };
  const openEdit = (n: Notification) => {
    setEditTarget(n);
    setForm({ title: n.title, body: n.body, isActive: n.isActive });
    setEditOpen(true);
  };

  const handleAdd = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: "خطأ", description: "العنوان والمحتوى مطلوبان", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/notifications", { title: form.title.trim(), body: form.body.trim(), isActive: form.isActive });
      toast({ title: "تم", description: "تمت إضافة الإشعار بنجاح" });
      setAddOpen(false);
      fetchNotifications();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editTarget || !form.title.trim() || !form.body.trim()) {
      toast({ title: "خطأ", description: "العنوان والمحتوى مطلوبان", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.put("/admin/notifications/" + editTarget.id, { title: form.title.trim(), body: form.body.trim(), isActive: form.isActive });
      toast({ title: "تم", description: "تم تعديل الإشعار بنجاح" });
      setEditOpen(false);
      fetchNotifications();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (n: Notification) => {
    if (!window.confirm("هل أنت متأكد من حذف الإشعار \"" + n.title + "\"؟")) return;
    try {
      await api.delete("/admin/notifications/" + n.id);
      toast({ title: "تم", description: "تم حذف الإشعار بنجاح" });
      fetchNotifications();
    } catch (error: any) {
      toast({ title: "خطأ", description: String(error), variant: "destructive" });
    }
  };

  const totalPages = Math.ceil(total / limit);

  const FormBody = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>العنوان *</Label>
        <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="عنوان الإشعار" />
      </div>
      <div className="space-y-2">
        <Label>المحتوى *</Label>
        <Textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} placeholder="نص الإشعار" rows={4} />
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
          <CardTitle className="text-2xl">الإشعارات</CardTitle>
          <Button onClick={openAdd}>إضافة إشعار</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">المحتوى</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">لا توجد إشعارات</TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-medium">{n.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {n.body.length > 80 ? n.body.slice(0, 80) + "..." : n.body}
                        </TableCell>
                        <TableCell>
                          <Badge variant={n.isActive ? "default" : "destructive"}>
                            {n.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(n.createdAt).toLocaleDateString("ar-EG")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(n)}>تعديل</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(n)}>حذف</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">إجمالي: {total} إشعار</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
                    <span className="text-sm py-1 px-2">{page} / {totalPages}</span>
                    <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إضافة إشعار</DialogTitle></DialogHeader>
          <FormBody />
          <DialogFooter className="flex gap-2 justify-start">
            <Button onClick={handleAdd} disabled={submitting}>{submitting ? "جاري الإضافة..." : "إضافة"}</Button>
            <Button variant="outline" onClick={() => setAddOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعديل الإشعار</DialogTitle></DialogHeader>
          <FormBody />
          <DialogFooter className="flex gap-2 justify-start">
            <Button onClick={handleEdit} disabled={submitting}>{submitting ? "جاري الحفظ..." : "حفظ"}</Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
