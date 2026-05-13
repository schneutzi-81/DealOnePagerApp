import { useState, useMemo } from 'react'
import { offerings, Offering, workPackages } from '@/lib/githubData'
import { OfferingCard } from '@/components/github/OfferingCard'
import { OfferingDetailsDialog } from '@/components/github/OfferingDetailsDialog'
import { Toaster } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass } from '@phosphor-icons/react'

type DeveloperRangeFilter = '1-10' | '10-50' | '50+' | '1+' | null
type CategoryFilter = 'core' | 'optional' | 'all'

export default function GitHubServices() {
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [developerFilter, setDeveloperFilter] = useState<DeveloperRangeFilter>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

  const filteredOfferings = useMemo(() => {
    return offerings.filter((offering) => {
      const matchesSearch =
        offering.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offering.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        !developerFilter ||
        (offering.developerRange && offering.developerRange.startsWith(developerFilter))

      const matchesCategory = categoryFilter === 'all' || offering.category === categoryFilter

      const matchesModule = !selectedModuleId || offering.workPackageIds.includes(selectedModuleId)

      return matchesSearch && matchesFilter && matchesCategory && matchesModule
    })
  }, [searchQuery, developerFilter, categoryFilter, selectedModuleId])

  const handleOfferingClick = (offering: Offering) => {
    setSelectedOffering(offering)
    setDialogOpen(true)
  }

  const toggleFilter = (filter: DeveloperRangeFilter) => {
    setDeveloperFilter(developerFilter === filter ? null : filter)
  }

  const toggleModuleFilter = (moduleId: string) => {
    setSelectedModuleId(selectedModuleId === moduleId ? null : moduleId)
  }

  const allWorkPackageIds = Array.from(new Set(filteredOfferings.flatMap((o) => o.workPackageIds)))
  const allModules = workPackages.filter((wp) => allWorkPackageIds.includes(wp.id))

  return (
    <div className="github-services-scope min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-[1400px]">
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-foreground">
              SoftwareOne • GitHub Services
            </h1>
            <p className="text-base text-muted-foreground max-w-4xl">
              Explore standardized offerings and drill down into detailed work packages. Built for
              clarity, governance, and measurable value.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Search offerings & work packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-3">
              {(['1-10', '10-50', '50+', '1+'] as DeveloperRangeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`px-4 h-11 rounded-lg text-sm font-medium transition-colors border ${
                    developerFilter === filter
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-card border-border text-foreground hover:border-primary/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOfferings.map((offering) => (
              <OfferingCard
                key={offering.id}
                offering={offering}
                onClick={() => handleOfferingClick(offering)}
              />
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Modules</h2>
              <div className="flex items-center gap-3">
                {(['all', 'core', 'optional'] as CategoryFilter[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`transition-all ${
                      categoryFilter === cat
                        ? 'bg-primary text-primary-foreground border-0'
                        : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                    } px-4 py-1.5 rounded-md text-sm font-medium border cursor-pointer`}
                  >
                    {cat === 'all' ? 'All' : cat === 'core' ? 'Core Services' : 'Additional Services'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {allModules.map((module) => (
                <Badge
                  key={module.id}
                  variant="outline"
                  onClick={() => toggleModuleFilter(module.id)}
                  className={`px-4 py-2 text-sm transition-all cursor-pointer ${
                    selectedModuleId === module.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                  }`}
                >
                  {module.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <OfferingDetailsDialog
        offering={selectedOffering}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Toaster />
    </div>
  )
}
