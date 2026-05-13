import { Offering } from '@/lib/githubData'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OfferingCardProps {
  offering: Offering
  onClick: () => void
}

export function OfferingCard({ offering, onClick }: OfferingCardProps) {
  return (
    <Card
      className="p-6 cursor-pointer transition-all duration-200 hover:border-primary/50 group h-full"
      onClick={onClick}
    >
      <div className="space-y-4 h-full flex flex-col">
        <div className="space-y-3">
          {offering.developerRange && (
            <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30 font-medium">
              {offering.developerRange}
            </Badge>
          )}
          {offering.duration && (
            <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-border ml-2">
              {offering.duration}
            </Badge>
          )}
        </div>

        <div className="space-y-3 flex-1">
          <h3 className="text-xl font-semibold text-foreground leading-tight">
            {offering.name}
          </h3>
          
          <p className="text-sm leading-relaxed text-muted-foreground">
            {offering.description}
          </p>
        </div>

        <div className="pt-2 text-sm text-primary hover:underline cursor-pointer">
          Click to view details →
        </div>
      </div>
    </Card>
  )
}
