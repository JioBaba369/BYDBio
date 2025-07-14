
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { availableIconNames, linkIconData } from '@/lib/link-icons';
import type { ProfileFormValues } from '@/lib/schemas/profile';

const SortableLinkItem = ({ index, remove }: { index: number, remove: (index: number) => void }) => {
  const { control, setValue, getValues } = useFormContext<ProfileFormValues>();
  const fieldId = getValues(`links.${index}.id`) || `link-${index}`;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: fieldId });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} className="flex items-start gap-2 p-4 touch-none bg-muted/30">
      <div {...listeners} className="cursor-grab p-2 pt-3">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={control}
            name={`links.${index}.icon`}
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormLabel>Icon</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const data = linkIconData[value as keyof typeof linkIconData];
                    if (data) {
                      setValue(`links.${index}.title`, data.title, { shouldDirty: true });
                      setValue(`links.${index}.url`, data.urlPrefix, { shouldDirty: true });
                    }
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={cn(!field.value && "text-muted-foreground")}><SelectValue placeholder="Select icon" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableIconNames.map((iconName) => {
                      const data = linkIconData[iconName];
                      const LoopIcon = data.icon;
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2"><LoopIcon className="h-4 w-4" /><span>{data.title}</span></div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={control} name={`links.${index}.title`} render={({ field }) => ( <FormItem className="sm:col-span-2"> <FormLabel>Link Title</FormLabel> <FormControl><Input {...field} placeholder="My Awesome Portfolio" /></FormControl> <FormMessage /> </FormItem> )}/>
        </div>
        <FormField control={control} name={`links.${index}.url`} render={({ field }) => ( <FormItem> <FormLabel>URL</FormLabel> <FormControl><Input {...field} placeholder="https://example.com" /></FormControl> <FormMessage /> </FormItem> )}/>
      </div>
      <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => remove(index)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </Card>
  );
};

export function LinksForm() {
  const { control } = useFormContext<ProfileFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "links" });
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((field) => (field.id || `link-${fields.indexOf(field)}`) === active.id);
      const newIndex = fields.findIndex((field) => (field.id || `link-${fields.indexOf(field)}`) === over!.id);
      move(oldIndex, newIndex);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Links</CardTitle>
        <CardDescription>Add, edit, or remove links for your link-in-bio page. Drag to reorder.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((f, i) => f.id || `link-${i}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <SortableLinkItem key={field.id || `link-${index}`} index={index} remove={remove} />
              ))}
              {fields.length === 0 && <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-lg">You haven't added any links yet.</div>}
            </div>
          </SortableContext>
        </DndContext>
        <Button type="button" variant="outline" className="w-full" onClick={() => append({ id: `link-${fields.length}`, icon: 'Link', title: '', url: '' })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Link
        </Button>
      </CardContent>
    </Card>
  );
}
