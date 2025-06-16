import { Breadcrumb, Button } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { PDFDownloadLink, Document, Page, Text, StyleSheet } from "@react-pdf/renderer";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import useCrudBill from "../../hooks/useCrudBill";
import { HiHome } from "react-icons/hi";

interface Bill {
  id: string;
  userId: string;
  month: string;
  prevReading: number;
  currentReading: number;
  amount: string;
  deadline: string;
  paidDate?: string;
}

const styles = StyleSheet.create({
  page: { padding: 20 },
  title: { fontSize: 18, marginBottom: 10, textAlign: "center" },
  section: { marginBottom: 5 },
});

const ReportsPage: FC = function () {
  const [bills, setBills] = useState<Bill[]>([]);
  const { getBills } = useCrudBill();

  useEffect(() => {
    getBills(setBills);
  }, []);

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Billing Report</Text>
        {bills.map((bill) => (
          <Text key={bill.id} style={styles.section}>
            {bill.month} - {bill.prevReading} - {bill.currentReading} - ${bill.amount}
          </Text>
        ))}
      </Page>
    </Document>
  );

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <Breadcrumb className="mb-2">
          <Breadcrumb.Item href="#">
            <HiHome className="text-xl mr-2" />
            <span className="dark:text-white">Home</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Reports</Breadcrumb.Item>
        </Breadcrumb>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Reports</h1>
      </div>
      <div className="p-4">
        <PDFDownloadLink document={doc} fileName="report.pdf">
          {({ loading }) => (
            <Button>{loading ? "Loading document..." : "Download PDF"}</Button>
          )}
        </PDFDownloadLink>
      </div>
    </NavbarSidebarLayout>
  );
};

export default ReportsPage;
