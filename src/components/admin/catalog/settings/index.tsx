import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Company, User } from "@prisma/client"
import { useState } from "react"
import { VariantsFormDrawer } from "./variants-form"

export function CatalogSettings({ user }: {
  user?: User & { company: Company }
}) {
  const [isSettingsDrawerOpen, onSettingsDrawerOpenChange] = useState(false)
  const [isNewVariantsDrawerOpen, onNewVariantsDrawerOpenChange] = useState(false)

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
            onOpenChange={onNewVariantsDrawerOpenChange}
            onSettingsDrawerOpenChange={onSettingsDrawerOpenChange}
          />

          {/* <CategoriesTable
          user={user}
          isReadonly={isReadonly}
          orderedCategories={orderedCategories}
          setOrderedCategories={setOrderedCategories}
          isCategoryUpdateEnabled={isCategoryUpdateEnabled}
          setIsCategoryUpdateEnabled={setIsCategoryUpdateEnabled}
          setSelectedCategory={setSelectedCategory}
        />  */}

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
  onSettingsDrawerOpenChange: (open: boolean) => void
}

function VariantsSection({
  onOpenChange,
  onSettingsDrawerOpenChange
}: VariantsSection) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-between gap-4">
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
    </div>
  )
}