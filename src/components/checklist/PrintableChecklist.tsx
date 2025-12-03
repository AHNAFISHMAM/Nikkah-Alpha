import { format } from 'date-fns'
import type { CategoryWithItems } from '../../pages/protected/Checklist'

interface PrintableChecklistProps {
  categories: CategoryWithItems[]
  completedSet: Set<string>
  progressMap: Map<string, { notes: string | null; discussWithPartner: boolean }>
}

export function PrintableChecklist({ categories, completedSet, progressMap }: PrintableChecklistProps) {
  return (
    <div className="printable-checklist hidden print:block">
      <div className="printable-checklist-header">
        <h1 className="printable-checklist-title">Marriage Readiness Checklist</h1>
        <p className="printable-checklist-date">Generated on {format(new Date(), 'MMMM dd, yyyy')}</p>
      </div>

      {categories.map((category) => {
        const items = Array.isArray(category.checklist_items) ? category.checklist_items : []
        
        return (
          <div key={category.id} className="printable-checklist-category">
            <h2 className="printable-checklist-category-title">
              {category.icon || '📋'} {category.name}
            </h2>
            {items.map((item) => {
              const isCompleted = completedSet.has(item.id)
              const progress = progressMap.get(item.id) || { notes: null, discussWithPartner: false }
              
              return (
                <div key={item.id} className="printable-checklist-item">
                  <div className={isCompleted ? 'printable-checklist-item-completed' : 'printable-checklist-item-incomplete'}>
                    <strong>{item.title}</strong>
                    {item.description && <span className="text-muted-foreground"> - {item.description}</span>}
                  </div>
                  {progress.notes && (
                    <div className="printable-checklist-item-notes">
                      📝 {progress.notes}
                    </div>
                  )}
                  {progress.discussWithPartner && (
                    <div className="printable-checklist-item-discuss">
                      💬 Discuss with partner
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

