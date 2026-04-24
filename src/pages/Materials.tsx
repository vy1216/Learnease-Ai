import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, PlusCircle, Loader2, FileText, ExternalLink, Search, Filter } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { apiUrl } from "@/lib/utils";

interface Material {
  id: string;
  name: string;
  description: string;
  file_url: string;
  uploader_id: string;
  created_at: string;
}

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialDescription, setNewMaterialDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/materials"));
      if (!response.ok) throw new Error("Failed to fetch materials");
      const data = await response.json();
      setMaterials(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching materials", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) setSelectedFile(event.target.files[0]);
  };

  const handleUploadMaterial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({ title: "Authentication Error", description: "You must be logged in to upload.", variant: "destructive" });
      return;
    }
    if (!newMaterialName.trim() || !selectedFile) {
      toast({ title: "Validation Error", description: "Material name and file are required.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("name", newMaterialName);
    formData.append("description", newMaterialDescription);
    formData.append("file", selectedFile);
    try {
      const response = await fetch(apiUrl("/api/materials"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload material");
      }
      fetchMaterials();
      toast({ title: "Material uploaded successfully!" });
      setUploadDialogOpen(false);
      setNewMaterialName("");
      setNewMaterialDescription("");
      setSelectedFile(null);
    } catch (error: any) {
      toast({ title: "Upload Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerRight = (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search materials..."
          className="pl-9 w-56 h-9 glass"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white border-0">
            <PlusCircle className="w-4 h-4 mr-2" /> Upload Material
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUploadMaterial}>
            <DialogHeader>
              <DialogTitle>Upload a new Material</DialogTitle>
              <DialogDescription>Share your study resources with the community.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="mat-name">Name</Label>
                <Input id="mat-name" value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} placeholder="e.g. React Cheatsheet" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mat-desc">Description</Label>
                <Input id="mat-desc" value={newMaterialDescription} onChange={(e) => setNewMaterialDescription(e.target.value)} placeholder="A quick guide to React hooks." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mat-file">File</Label>
                <Input id="mat-file" type="file" onChange={handleFileChange} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={uploading}>
                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <AppLayout title="Materials" headerRight={headerRight}>
      <div className="p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading materials...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No results found" : "No materials yet"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {searchQuery ? `No materials match "${searchQuery}"` : "Upload study materials to get started."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" /> Upload your first material
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{filtered.length} material{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((material) => (
                <Card key={material.id} className="glass border-border/60 hover:border-primary/30 transition-all group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base leading-snug">{material.name}</CardTitle>
                        <CardDescription className="text-xs mt-1 line-clamp-2">
                          {material.description || "No description provided."}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {new Date(material.created_at).toLocaleDateString()}
                      </Badge>
                      <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                          View <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Materials;
