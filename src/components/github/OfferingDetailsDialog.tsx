import { Offering, workPackages } from '@/lib/githubData'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WorkPackageCard } from './WorkPackageCard'
import { Badge } from '@/components/ui/badge'

interface OfferingDetailsDialogProps {
  offering: Offering | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OfferingDetailsDialog({
  offering,
  open,
  onOpenChange,
}: OfferingDetailsDialogProps) {
  if (!offering) return null

  const relatedPackages = workPackages.filter((pkg) =>
    offering.workPackageIds.includes(pkg.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-3xl font-semibold tracking-tight">
                {offering.name}
              </DialogTitle>
              {offering.developerRange && (
                <Badge variant="secondary">{offering.developerRange}</Badge>
              )}
            </div>
            <DialogDescription className="text-[15px] leading-relaxed">
              {offering.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="px-6 pb-6 max-h-[calc(85vh-120px)]">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-4">
                Work Packages ({relatedPackages.length})
              </h4>
              <div className="space-y-6">
                {relatedPackages.map((pkg) => (
                  <WorkPackageCard key={pkg.id} workPackage={pkg} />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
