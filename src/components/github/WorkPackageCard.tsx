import { WorkPackage } from '@/lib/githubData'
import { Clock, Users, FileText, CheckCircle, LinkBreak, Minus, Plus, Copy, Check } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

interface WorkPackageCardProps {
  workPackage: WorkPackage
}

export function WorkPackageCard({ workPackage }: WorkPackageCardProps) {
  const [copied, setCopied] = useState(false)

  const formatWorkPackageForCopy = () => {
    let text = `# Work Package – ${workPackage.name}\n\n`
    text += `**Starting point and objectives**\n${workPackage.startingPoint}\n\n`
    text += `**Scope of services**\n${workPackage.scope}\n\n`
    text += `**Customer involvement / Requirements**\n${workPackage.customerInvolvement}\n\n`
    text += `**Result / Deliverables**\n${workPackage.deliverables}\n\n`
    text += `**Effort estimation / Outlay**\n${workPackage.effort}\n\n`
    
    if (workPackage.dependencies) {
      text += `**Dependencies / Prerequisites**\n${workPackage.dependencies}\n\n`
    }
    
    if (workPackage.exclusions) {
      text += `**Exclusions**\n${workPackage.exclusions}\n\n`
    }
    
    if (workPackage.optionalExtensions) {
      text += `**Optional Extensions**\n${workPackage.optionalExtensions}\n\n`
    }
    
    return text
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatWorkPackageForCopy())
      setCopied(true)
      toast.success('Work package copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <Card className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-2xl font-semibold text-foreground">
          {workPackage.name}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? (
            <Check size={20} weight="bold" className="text-accent" />
          ) : (
            <Copy size={20} />
          )}
        </Button>
      </div>

      <Separator />

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <FileText size={18} weight="duotone" />
            Starting Point & Objectives
          </div>
          <p className="text-base leading-relaxed text-foreground">
            {workPackage.startingPoint}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <FileText size={18} weight="duotone" />
            Scope of Services
          </div>
          <div className="text-base leading-relaxed text-foreground">
            {workPackage.scope.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Users size={18} weight="duotone" />
            Customer Involvement / Requirements
          </div>
          <p className="text-base leading-relaxed text-foreground">
            {workPackage.customerInvolvement}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <CheckCircle size={18} weight="duotone" />
            Result / Deliverables
          </div>
          <p className="text-base leading-relaxed text-foreground">
            {workPackage.deliverables}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock size={18} weight="duotone" />
            Effort Estimation / Outlay
          </div>
          <p className="text-base leading-relaxed font-semibold text-accent-foreground bg-accent/10 px-4 py-3 rounded-md">
            {workPackage.effort}
          </p>
        </div>

        {workPackage.dependencies && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <LinkBreak size={18} weight="duotone" />
              Dependencies / Prerequisites
            </div>
            <p className="text-base leading-relaxed text-foreground">
              {workPackage.dependencies}
            </p>
          </div>
        )}

        {workPackage.exclusions && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Minus size={18} weight="duotone" />
              Exclusions
            </div>
            <p className="text-base leading-relaxed text-foreground">
              {workPackage.exclusions}
            </p>
          </div>
        )}

        {workPackage.optionalExtensions && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Plus size={18} weight="duotone" />
              Optional Extensions
            </div>
            <p className="text-base leading-relaxed text-foreground">
              {workPackage.optionalExtensions}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
