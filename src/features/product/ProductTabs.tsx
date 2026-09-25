import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export default function ProductTabs() {
    return (
        <Tabs defaultValue="description" className="w-full">
            <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="info">Additional Information</TabsTrigger>
                <TabsTrigger value="reviews">Reviews (128)</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>

            <TabsContent
                value="description"
                className="mt-0 rounded-b-lg border p-6"
            >
                <h2 className="text-lg font-bold">Product Description</h2>

                <p className="mt-4 text-sm leading-6 text-neutral-600">
                    This premium oil filter is engineered to provide superior
                    filtration and protection for your engine. It effectively
                    removes harmful contaminants, ensuring clean oil flow and
                    optimal engine performance.
                </p>

                <h3 className="mt-6 font-bold">Features</h3>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-600">
                    <li>High-efficiency filtration media</li>
                    <li>Durable construction for long service life</li>
                    <li>Meets or exceeds OEM specifications</li>
                    <li>Compatible with multiple vehicle models</li>
                </ul>

                <h3 className="mt-8 font-bold">Compatible Vehicles</h3>

                <div className="mt-4 overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Make</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Engine</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Toyota</TableCell>
                                <TableCell>Corolla</TableCell>
                                <TableCell>2010 - 2023</TableCell>
                                <TableCell>1.3L, 1.6L, 1.8L</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Toyota</TableCell>
                                <TableCell>Yaris</TableCell>
                                <TableCell>2012 - 2023</TableCell>
                                <TableCell>1.3L, 1.5L</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Toyota</TableCell>
                                <TableCell>RAV4</TableCell>
                                <TableCell>2010 - 2022</TableCell>
                                <TableCell>2.0L, 2.4L</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
        </Tabs>
    )
}