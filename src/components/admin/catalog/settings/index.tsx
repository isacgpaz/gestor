import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { useCatalogVariants } from "@/hooks/catalog/use-catalog-variants"
import { CatalogVariantWithProperties } from "@/types/catalog"
import { Company, User } from "@prisma/client"
import { Loader2, PackageOpen } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { VariantsFormDrawer } from "./variants-form"

export function CatalogSettings({ user }: {
  user?: User & { company: Company }
}) {
  const [isSettingsDrawerOpen, onSettingsDrawerOpenChange] = useState(false)
  const [isNewVariantsDrawerOpen, onNewVariantsDrawerOpenChange] = useState(false)

  const [selectedVariant, setSelectedVariant] = useState<CatalogVariantWithProperties | undefined>(undefined)

  return (
    <>
      <Drawer
        open={isSettingsDrawerOpen}
        onOpenChange={onSettingsDrawerOpenChange}
      >
        <DrawerTrigger asChild>
          <Button
            size='sm'
            className="w-fit text-primary"
            variant='secondary'
          >
            Configurações
          </Button>
        </DrawerTrigger>

        <DrawerContent className="max-h-[550px]">
          <DrawerHeader className="flex items-center justify-center">
            <DrawerTitle className="text-2xl">
              Configurações do catálogo
            </DrawerTitle>
          </DrawerHeader>

          <VariantsSection
            user={user}
            onOpenChange={onNewVariantsDrawerOpenChange}
            onSettingsDrawerOpenChange={onSettingsDrawerOpenChange}
            setSelectedVariant={setSelectedVariant}
          />

          <DrawerFooter className="flex-row gap-3 justify-end items-end px-6 mt-6">
            <DrawerClose asChild>
              <Button type='button' variant='outline'>
                Fechar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <VariantsFormDrawer
        variant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        user={user}
        open={isNewVariantsDrawerOpen}
        onOpenChange={onNewVariantsDrawerOpenChange}
        onSettingsDrawerOpenChange={onSettingsDrawerOpenChange}
      />
    </>
  )
}

type VariantsSection = {
  user?: User & { company: Company },
  onOpenChange: (open: boolean) => void,
  onSettingsDrawerOpenChange: (open: boolean) => void,
  setSelectedVariant: Dispatch<SetStateAction<CatalogVariantWithProperties | undefined>>;
}

function VariantsSection({
  user,
  onOpenChange,
  onSettingsDrawerOpenChange,
  setSelectedVariant
}: VariantsSection) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center gap-4">
        <h3 className="font-bold">Variantes</h3>

        <Button
          size='sm'
          variant='secondary'
          className="text-primary"
          onClick={() => {
            onOpenChange(true)
            onSettingsDrawerOpenChange(false)
          }}
        >
          Nova variante
        </Button>
      </div>

      <VariantsList
        user={user}
        setSelectedVariant={setSelectedVariant}
        onOpenChange={onOpenChange}
        onSettingsDrawerOpenChange={onSettingsDrawerOpenChange}
      />
    </div>
  )
}

type VariantsListProps = {
  user?: User & { company: Company },
  setSelectedVariant: Dispatch<SetStateAction<CatalogVariantWithProperties | undefined>>;
  onOpenChange: (open: boolean) => void,
  onSettingsDrawerOpenChange: (open: boolean) => void,
}

function VariantsList({
  user,
  setSelectedVariant,
  onOpenChange,
  onSettingsDrawerOpenChange
}: VariantsListProps) {
  const {
    data: catalogVariants,
    isLoading,
  } = useCatalogVariants({
    companyId: user?.company.id
  })

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando variantes...</span>
      </div>
    )
  }

  if (catalogVariants?.length) {
    return (
      <ul className="mt-4">
        {catalogVariants.map((variant) => (
          <li
            key={variant.id}
            onClick={() => {
              setSelectedVariant(variant)
              onOpenChange(true)
              onSettingsDrawerOpenChange(false)
            }}
          >
            <VariantCard variant={variant} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
      <PackageOpen />
      <span className="text-sm">Nenhuma variante encontrada.</span>
    </div>
  )
}

type VariantCardProps = {
  variant: CatalogVariantWithProperties
}

function VariantCard({ variant }: VariantCardProps) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="line-clamp-1">
          {variant.name}
        </CardTitle>

        <CardDescription>Propriedades</CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-4">
        <ul className="flex space-x-1">
          {variant.properties.map((property) => (
            <li key={property.name}>
              <Badge>
                {property.name}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}