"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown, ExternalLink, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Website {
  id: string
  name: string
  url: string
  description?: string
}

interface Category {
  id: string
  name: string
  websites: Website[]
}

const defaultCategories: Category[] = [
  {
    id: "ai-category",
    name: "AI",
    websites: [
      {
        id: "chatgpt",
        name: "ChatGPT",
        url: "https://chat.openai.com",
        description: "AI-powered conversational assistant",
      },
      { id: "claude", name: "Claude", url: "https://claude.ai", description: "Anthropic's AI assistant" },
      { id: "gemini", name: "Google Gemini", url: "https://gemini.google.com", description: "Google's AI chatbot" },
      {
        id: "copilot",
        name: "Microsoft Copilot",
        url: "https://copilot.microsoft.com",
        description: "Microsoft's AI assistant",
      },
    ],
  },
  {
    id: "news-category",
    name: "News",
    websites: [
      { id: "bbc", name: "BBC News", url: "https://bbc.com/news", description: "British Broadcasting Corporation" },
      { id: "cnn", name: "CNN", url: "https://cnn.com", description: "Cable News Network" },
      { id: "reuters", name: "Reuters", url: "https://reuters.com", description: "International news agency" },
      {
        id: "techcrunch",
        name: "TechCrunch",
        url: "https://techcrunch.com",
        description: "Technology news and analysis",
      },
    ],
  },
  {
    id: "movies-category",
    name: "Movies",
    websites: [
      { id: "netflix", name: "Netflix", url: "https://netflix.com", description: "Streaming service" },
      { id: "imdb", name: "IMDb", url: "https://imdb.com", description: "Internet Movie Database" },
      { id: "disney", name: "Disney+", url: "https://disneyplus.com", description: "Disney streaming platform" },
      { id: "prime", name: "Prime Video", url: "https://primevideo.com", description: "Amazon's streaming service" },
    ],
  },
  {
    id: "songs-category",
    name: "Songs",
    websites: [
      { id: "spotify", name: "Spotify", url: "https://spotify.com", description: "Music streaming platform" },
      {
        id: "youtube-music",
        name: "YouTube Music",
        url: "https://music.youtube.com",
        description: "Google's music service",
      },
      {
        id: "apple-music",
        name: "Apple Music",
        url: "https://music.apple.com",
        description: "Apple's music streaming",
      },
      { id: "soundcloud", name: "SoundCloud", url: "https://soundcloud.com", description: "Audio platform" },
    ],
  },
  {
    id: "social-media-category",
    name: "Social Media",
    websites: [
      { id: "twitter", name: "Twitter/X", url: "https://x.com", description: "Social networking platform" },
      { id: "facebook", name: "Facebook", url: "https://facebook.com", description: "Social media platform" },
      { id: "instagram", name: "Instagram", url: "https://instagram.com", description: "Photo and video sharing" },
      { id: "linkedin", name: "LinkedIn", url: "https://linkedin.com", description: "Professional networking" },
    ],
  },
]

export default function WebsyncApp() {
  const [categories, setCategories] = useState<Category[]>([])
  const [googleSearch, setGoogleSearch] = useState("")
  const [localSearch, setLocalSearch] = useState("")
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newWebsite, setNewWebsite] = useState({ name: "", url: "", description: "" })
  const [editingWebsite, setEditingWebsite] = useState<{ website: Website; categoryId: string } | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null)
  const [draggedWebsite, setDraggedWebsite] = useState<{ websiteId: string; categoryId: string } | null>(null)

  const { theme, setTheme } = useTheme()

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCategories = localStorage.getItem("websync-categories")
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories)
        // If saved categories exist and are not empty, use them
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed)
          setFilteredCategories(parsed)
        } else {
          // If saved categories are empty or invalid, load defaults
          setCategories(defaultCategories)
          setFilteredCategories(defaultCategories)
          localStorage.setItem("websync-categories", JSON.stringify(defaultCategories))
        }
      } catch (error) {
        // If parsing fails, load defaults
        console.error("Error parsing saved categories:", error)
        setCategories(defaultCategories)
        setFilteredCategories(defaultCategories)
        localStorage.setItem("websync-categories", JSON.stringify(defaultCategories))
      }
    } else {
      // Load default categories if no saved data exists
      setCategories(defaultCategories)
      setFilteredCategories(defaultCategories)
      localStorage.setItem("websync-categories", JSON.stringify(defaultCategories))
    }
  }, [])

  // Save to localStorage whenever categories change
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem("websync-categories", JSON.stringify(categories))
      setFilteredCategories(categories)
    }
  }, [categories])

  // Filter categories and websites based on local search
  useEffect(() => {
    if (!localSearch.trim()) {
      setFilteredCategories(categories)
      return
    }

    const filtered = categories
      .map((category) => {
        const matchingWebsites = category.websites.filter(
          (website) =>
            website.name.toLowerCase().includes(localSearch.toLowerCase()) ||
            website.url.toLowerCase().includes(localSearch.toLowerCase()) ||
            website.description?.toLowerCase().includes(localSearch.toLowerCase()),
        )

        const categoryMatches = category.name.toLowerCase().includes(localSearch.toLowerCase())

        if (categoryMatches || matchingWebsites.length > 0) {
          return {
            ...category,
            websites: categoryMatches ? category.websites : matchingWebsites,
          }
        }
        return null
      })
      .filter(Boolean) as Category[]

    setFilteredCategories(filtered)
  }, [localSearch, categories])

  const handleGoogleSearch = () => {
    if (googleSearch.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(googleSearch)}`, "_blank")
      setGoogleSearch("")
    }
  }

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto max-w-sm",
      })
      return
    }

    // Check if category name already exists (case-insensitive)
    const categoryExists = categories.some((cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())

    if (categoryExists) {
      toast({
        title: "Error",
        description: "A category with this name already exists",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto max-w-sm",
      })
      return
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      websites: [],
    }
    setCategories([...categories, newCategory])
    setNewCategoryName("")

    // Close dialog and show success toast
    setIsDialogOpen(false)

    toast({
      title: "Success",
      description: `Category "${newCategoryName.trim()}" added successfully`,
      className: "fixed top-4 right-4 w-auto max-w-sm bg-green-500 text-white",
    })
  }

  const editCategory = (category: Category) => {
    setEditingCategory(category)
  }

  const updateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      setCategories(categories.map((cat) => (cat.id === editingCategory.id ? editingCategory : cat)))
      setEditingCategory(null)
    }
  }

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId))
  }

  const addWebsite = () => {
    if (newWebsite.name.trim() && newWebsite.url.trim() && selectedCategoryId) {
      let url = newWebsite.url.trim()
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url
      }

      const website: Website = {
        id: Date.now().toString(),
        name: newWebsite.name.trim(),
        url: url,
        description: newWebsite.description.trim(),
      }

      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategoryId ? { ...cat, websites: [...cat.websites, website] } : cat,
        ),
      )

      setNewWebsite({ name: "", url: "", description: "" })
      setSelectedCategoryId("")
    }
  }

  const editWebsite = (website: Website, categoryId: string) => {
    setEditingWebsite({ website: { ...website }, categoryId })
  }

  const updateWebsite = () => {
    if (editingWebsite && editingWebsite.website.name.trim() && editingWebsite.website.url.trim()) {
      let url = editingWebsite.website.url.trim()
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url
      }

      setCategories(
        categories.map((cat) =>
          cat.id === editingWebsite.categoryId
            ? {
                ...cat,
                websites: cat.websites.map((site) =>
                  site.id === editingWebsite.website.id ? { ...editingWebsite.website, url } : site,
                ),
              }
            : cat,
        ),
      )
      setEditingWebsite(null)
    }
  }

  const deleteWebsite = (websiteId: string, categoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, websites: cat.websites.filter((site) => site.id !== websiteId) } : cat,
      ),
    )
  }

  const moveWebsite = (categoryId: string, websiteId: string, direction: "up" | "down") => {
    setCategories(
      categories.map((cat) => {
        if (cat.id !== categoryId) return cat

        const websites = [...cat.websites]
        const index = websites.findIndex((site) => site.id === websiteId)

        if (direction === "up" && index > 0) {
          ;[websites[index], websites[index - 1]] = [websites[index - 1], websites[index]]
        } else if (direction === "down" && index < websites.length - 1) {
          ;[websites[index], websites[index + 1]] = [websites[index + 1], websites[index]]
        }

        return { ...cat, websites }
      }),
    )
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return `https://www.google.com/s2/favicons?domain=example.com&sz=32`
    }
  }

  // Category drag and drop handlers
  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategory(categoryId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleCategoryDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()

    if (draggedCategory && draggedCategory !== targetCategoryId) {
      const draggedIndex = categories.findIndex((cat) => cat.id === draggedCategory)
      const targetIndex = categories.findIndex((cat) => cat.id === targetCategoryId)

      const newCategories = [...categories]
      const [draggedItem] = newCategories.splice(draggedIndex, 1)
      newCategories.splice(targetIndex, 0, draggedItem)

      setCategories(newCategories)
    }

    setDraggedCategory(null)
  }

  // Website drag and drop handlers
  const handleWebsiteDragStart = (e: React.DragEvent, websiteId: string, categoryId: string) => {
    setDraggedWebsite({ websiteId, categoryId })
    e.dataTransfer.effectAllowed = "move"
  }

  const handleWebsiteDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleWebsiteDropOnCategory = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedWebsite && draggedWebsite.categoryId !== targetCategoryId) {
      // Move website to different category
      const sourceCategory = categories.find((cat) => cat.id === draggedWebsite.categoryId)
      const website = sourceCategory?.websites.find((site) => site.id === draggedWebsite.websiteId)

      if (website) {
        setCategories(
          categories.map((cat) => {
            if (cat.id === draggedWebsite.categoryId) {
              // Remove from source category
              return { ...cat, websites: cat.websites.filter((site) => site.id !== draggedWebsite.websiteId) }
            } else if (cat.id === targetCategoryId) {
              // Add to target category
              return { ...cat, websites: [...cat.websites, website] }
            }
            return cat
          }),
        )
      }
    }

    setDraggedWebsite(null)
  }

  const handleWebsiteDropOnWebsite = (e: React.DragEvent, targetWebsiteId: string, targetCategoryId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedWebsite) {
      if (draggedWebsite.categoryId === targetCategoryId) {
        // Reorder within same category
        setCategories(
          categories.map((cat) => {
            if (cat.id === targetCategoryId) {
              const websites = [...cat.websites]
              const draggedIndex = websites.findIndex((site) => site.id === draggedWebsite.websiteId)
              const targetIndex = websites.findIndex((site) => site.id === targetWebsiteId)

              const [draggedItem] = websites.splice(draggedIndex, 1)
              websites.splice(targetIndex, 0, draggedItem)

              return { ...cat, websites }
            }
            return cat
          }),
        )
      } else {
        // Move to different category at specific position
        const sourceCategory = categories.find((cat) => cat.id === draggedWebsite.categoryId)
        const website = sourceCategory?.websites.find((site) => site.id === draggedWebsite.websiteId)

        if (website) {
          setCategories(
            categories.map((cat) => {
              if (cat.id === draggedWebsite.categoryId) {
                return { ...cat, websites: cat.websites.filter((site) => site.id !== draggedWebsite.websiteId) }
              } else if (cat.id === targetCategoryId) {
                const websites = [...cat.websites]
                const targetIndex = websites.findIndex((site) => site.id === targetWebsiteId)
                websites.splice(targetIndex, 0, website)
                return { ...cat, websites }
              }
              return cat
            }),
          )
        }
      }
    }

    setDraggedWebsite(null)
  }

  const resetToDefaults = () => {
    setCategories(defaultCategories)
    setFilteredCategories(defaultCategories)
    localStorage.setItem("websync-categories", JSON.stringify(defaultCategories))
    toast({
      title: "Success",
      description: "Categories reset to defaults successfully",
      className: "fixed top-4 right-4 w-auto max-w-sm bg-green-500 text-white",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">LinkVerse</h1>

          {/* Search Bars */}
          <div className="flex-1 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Google Search */}
              <div className="space-y-2">
                <Label htmlFor="google-search">Search on Google</Label>
                <div className="flex gap-2">
                  <Input
                    id="google-search"
                    placeholder="Search anything on Google..."
                    value={googleSearch}
                    onChange={(e) => setGoogleSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleGoogleSearch()}
                  />
                  <Button onClick={handleGoogleSearch} className="bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Local Search */}
              <div className="space-y-2">
                <Label htmlFor="local-search">Search your websites & categories</Label>
                <div className="flex gap-2">
                  <Input
                    id="local-search"
                    placeholder="Search your saved websites or categories..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <Button variant="outline" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Category Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Categories</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 bg-transparent"
              >
                Reset to Defaults
              </Button>
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (open) {
                    setNewCategoryName("")
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category-name">Category Name</Label>
                      <Input
                        id="category-name"
                        placeholder="Enter category name..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>
                    <Button onClick={addCategory} className="w-full">
                      Add Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCategories.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                {localSearch
                  ? "No categories or websites match your search."
                  : "No categories yet. Add your first category to get started!"}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <Card
                    key={category.id}
                    className={`border-l-4 border-l-blue-500 h-fit transition-all duration-200 ${
                      draggedCategory === category.id ? "opacity-50 scale-95" : ""
                    } ${draggedWebsite && draggedWebsite.categoryId !== category.id ? "ring-2 ring-blue-300 ring-opacity-50" : ""}`}
                    draggable
                    onDragStart={(e) => handleCategoryDragStart(e, category.id)}
                    onDragOver={handleCategoryDragOver}
                    onDrop={(e) => {
                      handleCategoryDrop(e, category.id)
                      handleWebsiteDropOnCategory(e, category.id)
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <GripVertical className="h-4 w-4 text-slate-400 cursor-grab flex-shrink-0" />
                          <CardTitle
                            className="text-lg whitespace-nowrap overflow-hidden text-ellipsis"
                            title={category.name}
                          >
                            {category.name}
                          </CardTitle>
                          <Badge variant="secondary" className="flex-shrink-0">
                            {category.websites.length}
                          </Badge>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-xs bg-transparent px-2 py-1">
                                <Plus className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Add</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Website to {category.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="website-name">Website Name</Label>
                                  <Input
                                    id="website-name"
                                    placeholder="e.g., Google"
                                    value={newWebsite.name}
                                    onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="website-url">Website URL</Label>
                                  <Input
                                    id="website-url"
                                    placeholder="e.g., google.com"
                                    value={newWebsite.url}
                                    onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="website-description">Description (Optional)</Label>
                                  <Input
                                    id="website-description"
                                    placeholder="Brief description..."
                                    value={newWebsite.description}
                                    onChange={(e) => setNewWebsite({ ...newWebsite, description: e.target.value })}
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    setSelectedCategoryId(category.id)
                                    addWebsite()
                                  }}
                                  className="w-full"
                                >
                                  Add Website
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editCategory(category)}
                                className="text-xs px-2 py-1"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                              </DialogHeader>
                              {editingCategory && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-category-name">Category Name</Label>
                                    <Input
                                      id="edit-category-name"
                                      value={editingCategory.name}
                                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    />
                                  </div>
                                  <Button onClick={updateCategory} className="w-full">
                                    Update Category
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCategory(category.id)}
                            className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {category.websites.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                          No websites in this category yet.
                        </p>
                      ) : (
                        <div className="grid gap-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                          {category.websites.map((website, index) => (
                            <div
                              key={website.id}
                              className={`flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-move transition-all duration-200 ${
                                draggedWebsite?.websiteId === website.id ? "opacity-50 scale-95" : ""
                              }`}
                              draggable
                              onDragStart={(e) => handleWebsiteDragStart(e, website.id, category.id)}
                              onDragOver={handleWebsiteDragOver}
                              onDrop={(e) => handleWebsiteDropOnWebsite(e, website.id, category.id)}
                            >
                              <div className="flex flex-col gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveWebsite(category.id, website.id, "up")}
                                  disabled={index === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveWebsite(category.id, website.id, "down")}
                                  disabled={index === category.websites.length - 1}
                                  className="h-6 w-6 p-0"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>

                              <GripVertical className="h-4 w-4 text-slate-400 cursor-grab flex-shrink-0" />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium break-words leading-tight" title={website.name}>
                                    {website.name}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(website.url, "_blank")}
                                    className="h-6 w-6 p-0 flex-shrink-0"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p
                                  className="text-sm text-slate-600 dark:text-slate-300 break-all leading-tight"
                                  title={website.url}
                                >
                                  {website.url}
                                </p>
                                {website.description && (
                                  <p
                                    className="text-sm text-slate-500 dark:text-slate-400 break-words leading-tight"
                                    title={website.description}
                                  >
                                    {website.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-1 flex-shrink-0">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => editWebsite(website, category.id)}>
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Website</DialogTitle>
                                    </DialogHeader>
                                    {editingWebsite && (
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="edit-website-name">Website Name</Label>
                                          <Input
                                            id="edit-website-name"
                                            value={editingWebsite.website.name}
                                            onChange={(e) =>
                                              setEditingWebsite({
                                                ...editingWebsite,
                                                website: { ...editingWebsite.website, name: e.target.value },
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="edit-website-url">Website URL</Label>
                                          <Input
                                            id="edit-website-url"
                                            value={editingWebsite.website.url}
                                            onChange={(e) =>
                                              setEditingWebsite({
                                                ...editingWebsite,
                                                website: { ...editingWebsite.website, url: e.target.value },
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="edit-website-description">Description</Label>
                                          <Input
                                            id="edit-website-description"
                                            value={editingWebsite.website.description || ""}
                                            onChange={(e) =>
                                              setEditingWebsite({
                                                ...editingWebsite,
                                                website: { ...editingWebsite.website, description: e.target.value },
                                              })
                                            }
                                          />
                                        </div>
                                        <Button onClick={updateWebsite} className="w-full">
                                          Update Website
                                        </Button>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteWebsite(website.id, category.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <div className="text-center space-y-2">
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Developed by <span className="text-slate-800 dark:text-slate-200 font-semibold">Yug Patel</span>
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm">
              Contact:{" "}
              <a href="tel:+919510303247" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                +91 9510303247
              </a>
            </p>
            <p className="text-slate-400 dark:text-slate-600 text-xs">© 2025 LinkVerse. All rights reserved.</p>
          </div>
        </footer>
        <Toaster />
      </div>
    </div>
  )
}
