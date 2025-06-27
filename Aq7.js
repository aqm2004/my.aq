document.addEventListener('DOMContentLoaded', function() {
    // تعيين تاريخ اليوم كقيمة افتراضية
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('itemDate').value = today;
    
    // تحميل البيانات من localStorage إذا وجدت
    let items = JSON.parse(localStorage.getItem('storeItems')) || [];
    
    // عرض البيانات في الجدول
    renderItemsTable(items);
    
    // إضافة مادة جديدة
    document.getElementById('itemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const itemName = document.getElementById('itemName').value;
        const itemQuantity = document.getElementById('itemQuantity').value;
        const itemUnit = document.getElementById('itemUnit').value;
        const itemSection = document.getElementById('itemSection').value;
        const itemDate = document.getElementById('itemDate').value;
        
        const newItem = {
            id: Date.now(),
            name: itemName,
            quantity: itemQuantity,
            unit: itemUnit,
            section: itemSection,
            date: itemDate
        };
        
        items.push(newItem);
        saveItems(items);
        renderItemsTable(items);
        
        // إعادة تعيين النموذج
        this.reset();
        document.getElementById('itemDate').value = today;
    });
    
    // تصفية وعرض التقرير
    document.getElementById('generateReport').addEventListener('click', function() {
        generateReport();
    });
    
    // طباعة التقرير
    document.getElementById('printReport').addEventListener('click', function() {
        printReport();
    });
    
    // وظائف مساعدة
    function saveItems(itemsArray) {
        localStorage.setItem('storeItems', JSON.stringify(itemsArray));
    }
    
    function renderItemsTable(itemsArray) {
        const tableBody = document.getElementById('itemsTable');
        tableBody.innerHTML = '';
        
        if (itemsArray.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد سجلات</td></tr>';
            return;
        }
        
        // عرض آخر 10 سجلات
        const recentItems = itemsArray.slice(-10).reverse();
        
        recentItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>${item.section}</td>
                <td>${formatDate(item.date)}</td>
                <td><button class="delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button></td>
            `;
            tableBody.appendChild(row);
        });
        
        // إضافة أحداث لحذف العناصر
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                items = items.filter(item => item.id !== itemId);
                saveItems(items);
                renderItemsTable(items);
                generateReport(); // تحديث التقرير بعد الحذف
            });
        });
    }
    
    function generateReport() {
        const section = document.getElementById('reportSection').value;
        const fromDate = document.getElementById('reportFromDate').value;
        const toDate = document.getElementById('reportToDate').value;
        
        let filteredItems = [...items];
        
        // تصفية حسب القسم
        if (section !== 'all') {
            filteredItems = filteredItems.filter(item => item.section === section);
        }
        
        // تصفية حسب التاريخ
        if (fromDate) {
            filteredItems = filteredItems.filter(item => item.date >= fromDate);
        }
        
        if (toDate) {
            filteredItems = filteredItems.filter(item => item.date <= toDate);
        }
        
        // عرض النتائج
        const reportResults = document.getElementById('reportResults');
        
        if (filteredItems.length === 0) {
            reportResults.innerHTML = '<p class="text-center">لا توجد نتائج تطابق معايير البحث</p>';
            return;
        }
        
        // تجميع المواد المكررة
        const groupedItems = {};
        
        filteredItems.forEach(item => {
            const key = `${item.name}-${item.unit}-${item.section}`;
            if (groupedItems[key]) {
                groupedItems[key].quantity += parseInt(item.quantity);
            } else {
                groupedItems[key] = {
                    name: item.name,
                    quantity: parseInt(item.quantity),
                    unit: item.unit,
                    section: item.section
                };
            }
        });
        
        // تحويل الكائن إلى مصفوفة
        const groupedArray = Object.values(groupedItems);
        
        // عرض التقرير
        let html = '<h4 class="mb-3">ملخص السحوبات</h4>';
        
        groupedArray.forEach(item => {
            html += `
                <div class="report-item">
                    <span>${item.name} (${item.section})</span>
                    <span><strong>${item.quantity} ${item.unit}</strong></span>
                </div>
            `;
        });
        
        // إضافة المجموع الكلي
        const totalQuantity = groupedArray.reduce((sum, item) => sum + item.quantity, 0);
        html += `
            <div class="report-item mt-3" style="background-color: #f8f9fa; border-radius: 8px;">
                <span><strong>المجموع الكلي</strong></span>
                <span><strong>${totalQuantity} وحدة</strong></span>
            </div>
        `;
        
        reportResults.innerHTML = html;
    }
    
    function printReport() {
        const section = document.getElementById('reportSection').value;
        const fromDate = document.getElementById('reportFromDate').value;
        const toDate = document.getElementById('reportToDate').value;
        
        let filteredItems = [...items];
        
        // تصفية حسب القسم
        if (section !== 'all') {
            filteredItems = filteredItems.filter(item => item.section === section);
        }
        
        // تصفية حسب التاريخ
        if (fromDate) {
            filteredItems = filteredItems.filter(item => item.date >= fromDate);
        }
        
        if (toDate) {
            filteredItems = filteredItems.filter(item => item.date <= toDate);
        }
        
        // تجميع المواد المكررة
        const groupedItems = {};
        
        filteredItems.forEach(item => {
            const key = `${item.name}-${item.unit}-${item.section}`;
            if (groupedItems[key]) {
                groupedItems[key].quantity += parseInt(item.quantity);
            } else {
                groupedItems[key] = {
                    name: item.name,
                    quantity: parseInt(item.quantity),
                    unit: item.unit,
                    section: item.section
                };
            }
        });
        
        // تحويل الكائن إلى مصفوفة
        const groupedArray = Object.values(groupedItems);
        
        // تعبئة نموذج الطباعة
        document.getElementById('printSection').textContent = section === 'all' ? 'جميع الأقسام' : section;
        document.getElementById('printFromDate').textContent = fromDate ? formatDate(fromDate) : 'بداية السجلات';
        document.getElementById('printToDate').textContent = toDate ? formatDate(toDate) : 'آخر تاريخ';
        document.getElementById('printCurrentDate').textContent = formatDate(today);
        
        const printTableBody = document.getElementById('printTableBody');
        printTableBody.innerHTML = '';
        
        groupedArray.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>${item.section}</td>
                <td>${formatDate(today)}</td>
            `;
            printTableBody.appendChild(row);
        });
        
        // إضافة المجموع الكلي
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td colspan="2"><strong>المجموع الكلي</strong></td>
            <td colspan="3"><strong>${groupedArray.reduce((sum, item) => sum + item.quantity, 0)} وحدة</strong></td>
        `;
        printTableBody.appendChild(totalRow);
        
        // طباعة التقرير
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>تقرير سحوبات المواد</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                        th { background-color: #f2f2f2; }
                        .text-center { text-align: center; }
                        .header { margin-bottom: 30px; }
                    </style>
                </head>
                <body>
                    ${document.getElementById('printArea').innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ar-EG', options);
    }
});