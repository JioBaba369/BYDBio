'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CandlestickChart } from "lucide-react";

const reportData = [
  { period: "H2 2023", requests: 0, usersAffected: 0, percentage: "0%" },
  { period: "H1 2024", requests: 0, usersAffected: 0, percentage: "0%" },
];

export default function TransparencyReportPage() {
  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">
            <CandlestickChart /> Transparency Report
        </CardTitle>
        <CardDescription>
            This report provides information about government requests for user data.
        </CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-6">
            <p className="prose dark:prose-invert max-w-none">
                BYD.Bio is committed to transparency. We believe that you have a right to know if a government agency is requesting your data. As of the launch of this platform, we have received zero government requests for user data. We will update this report semi-annually.
            </p>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle>Government Data Requests</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reporting Period</TableHead>
                        <TableHead>Total Requests</TableHead>
                        <TableHead>Accounts/Users Specified</TableHead>
                        <TableHead>Percentage of Users Affected</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reportData.map(row => (
                        <TableRow key={row.period}>
                            <TableCell className="font-medium">{row.period}</TableCell>
                            <TableCell>{row.requests}</TableCell>
                            <TableCell>{row.usersAffected}</TableCell>
                            <TableCell>{row.percentage}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
