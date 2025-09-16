"use client"

import { dayjs } from "@raypx/shared/utils"
import { Badge } from "@raypx/ui/components/badge"
import { Card, CardContent, CardHeader } from "@raypx/ui/components/card"
import { Calendar, Tag } from "lucide-react"
import { useLocale } from "next-intl"

interface ChangelogCardProps {
  body: React.ReactNode
  date?: Date
  version: string
  title: string
  description?: string
}

export const ChangelogCard = (props: ChangelogCardProps) => {
  const lang = useLocale()
  const formattedDate = dayjs(props.date).locale(lang).format("LL")

  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-primary">
          <Tag className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="font-mono text-base px-3 py-1"
                  >
                    {props.version}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={formattedDate}>{formattedDate}</time>
                  </div>
                </div>
                <h2 className="text-2xl font-bold">{props.title}</h2>
                {props.description && (
                  <p className="text-muted-foreground">{props.description}</p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground prose-li:text-muted-foreground">
              {props.body}
            </article>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
