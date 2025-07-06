/*
  --------------------------------------------------------------------------------------
  Alternar entre a exibição de faturas e empresas
  --------------------------------------------------------------------------------------
*/

document.addEventListener('DOMContentLoaded', function() {

  // butões

  const showInvoicesBtn = document.getElementById('showInvoices');
  const showCompaniesBtn = document.getElementById('showCompanies');
  const searchInvoicesBtn = document.getElementById('searchInvoices');
  const searchCompaniesBtn = document.getElementById('searchCompanies');

  // seções

  const invoiceSection = document.getElementById('invoiceSection');
  const companySection = document.getElementById('companySection');
  const invoiceSearchSection = document.getElementById('invoiceSearchSection');
  const companySearchSection = document.getElementById('companySearchSection');

  // esconde todas as seções

  function hideAllSections() {
    invoiceSection.style.display = 'none';
    companySection.style.display = 'none';
    invoiceSearchSection.style.display = 'none';
    companySearchSection.style.display = 'none';
  }

  // desativa todos os botões

  function deactivateAllButtons() {
    showInvoicesBtn.classList.remove('active');
    showCompaniesBtn.classList.remove('active');
    searchInvoicesBtn.classList.remove('active');
    searchCompaniesBtn.classList.remove('active');
  }

  // Alternar para Inserir Faturas

  showInvoicesBtn.addEventListener('click', function() {
    hideAllSections();
    invoiceSection.style.display = 'block';
    deactivateAllButtons();
    this.classList.add('active');
  });

  // Alternar para Inserir Empresas

  showCompaniesBtn.addEventListener('click', function() {
    hideAllSections();
    companySection.style.display = 'block';
    deactivateAllButtons();
    this.classList.add('active');
  });

  // Alternar para Procurar Faturas
  
  searchInvoicesBtn.addEventListener('click', function() {
    hideAllSections();
    invoiceSearchSection.style.display = 'block';
    deactivateAllButtons();
    this.classList.add('active');
  });

  // Alternar para Procurar Empresas

  searchCompaniesBtn.addEventListener('click', function() {
    hideAllSections();
    companySearchSection.style.display = 'block';
    deactivateAllButtons();
    this.classList.add('active');
  });

  // Default Inserir Faturas

  hideAllSections();
  invoiceSection.style.display = 'block';
  deactivateAllButtons();
  showInvoicesBtn.classList.add('active');

});

/*
  --------------------------------------------------------------------------------------
  Tabela Faturas
  --------------------------------------------------------------------------------------
*/

/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/

const getInvoicesList = async () => {
  const url = 'http://localhost:5000/getInvoices';

  try {
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Erro ao buscar faturas: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (Array.isArray(data.invoices)) {
      data.invoices.forEach(item => insertInvoiceList(
        item.InvoiceNumber,
        item.InvoiceCompanyCNPJ,
        item.Value,
        item.PaymentDate
      ));
    } else {
      console.warn('Resposta inesperada do backend:', data);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};

/*
  --------------------------------------------------------------------------------------
  Função para colocar uma fatura na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/

const postInvoice = async (inputInvoice, inputInvoiceCNPJ, inputValue, inputPaymentDate) => {

  const formData = new FormData();
  formData.append('InvoiceNumber', inputInvoice);
  formData.append('InvoiceCompanyCNPJ', inputInvoiceCNPJ);
  formData.append('Value', inputValue);
  formData.append('PaymentDate', inputPaymentDate);


  let url = 'http://localhost:5000/addInvoice';

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const backendMessage = data?.message || `${response.status} ${response.statusText}`;
    throw new Error(backendMessage);
  }

  return data;

}
/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com invoice, descrição, valor e data de pagamento 
  --------------------------------------------------------------------------------------
*/

const newInvoiceItem = async (number, cnpj, value, payment_date) => {
  const inputInvoice = document.getElementById("newInvoice").value.trim();
  const inputInvoiceCNPJ = document.getElementById("newInvoiceCNPJ").value.trim();
  let inputValue = document.getElementById("newValue").value.trim();
  const inputPaymentDate = document.getElementById("newPaymentDate").value.trim();

  if (!inputInvoice) {
    alert("Escreva o código da fatura!");
    return;
  }

  if (!inputInvoiceCNPJ) {
    alert("Escreva o CNPJ da empresa!");
    return;
  }

  if (!inputValue) {
    alert("Valor precisa ser um número válido!");
    return;
  }

  if (!inputPaymentDate) {
    alert("Insira uma data de pagamento válida!");
    return;
  }

  // troca "," por "." no inputValue converte-o de string para float

  inputValue = inputValue.replace('.', '').replace(',', '.');
  const inputFloatValue = parseFloat(inputValue);

  // converte inputPaymentDate para string no formato DD/MM/YYYY

  const [year, month, day] = inputPaymentDate.split("-");
  const formattedDate = `${day}/${month}/${year}`;

  try {
    await postInvoice(inputInvoice, inputInvoiceCNPJ, inputFloatValue, formattedDate)
    insertInvoiceList(inputInvoice, inputInvoiceCNPJ, inputValue, inputPaymentDate)
    alert("Item adicionado!")
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir fatura na lista apresentada
  --------------------------------------------------------------------------------------
*/

const insertInvoiceList = (invoice, invoice_cnpj, value, payment_date) => {
  var item = [invoice, invoice_cnpj, value, payment_date]
  var table = document.getElementById('InvoicesTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }

  insertButton(row.insertCell(-1), 'invoice', { 
    InvoiceNumber: invoice,
    CompanyCNPJ: invoice_cnpj 
  });

  document.getElementById("newInvoice").value = "";
  document.getElementById("newInvoiceCNPJ").value = "";
  document.getElementById("newValue").value = "";
  document.getElementById("newPaymentDate").value = "";

  removeElement()
}

/*
  --------------------------------------------------------------------------------------
  Tabela Empresas
  --------------------------------------------------------------------------------------
*/

/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/

const getCompaniesList = async () => {
  const url = 'http://localhost:5000/getCompanies';

  try {
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Erro ao buscar empresas: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (Array.isArray(data.companies)) {
      data.companies.forEach(item => insertCompanyList(item.CompanyCNPJ, item.CompanyName));
    } else {
      console.warn('Resposta inesperada do backend:', data);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};

/*
  --------------------------------------------------------------------------------------
  Função para adicionar nova empresa no servidor via requisição POST
  --------------------------------------------------------------------------------------
*/

const postCompany = async (cnpj, name) => {

  const formData = new FormData();
  formData.append('CompanyCNPJ', cnpj);
  formData.append('CompanyName', name);

  const url = 'http://localhost:5000/addCompany';

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const backendMessage = data?.message || `${response.status} ${response.statusText}`;
    throw new Error(backendMessage);
  }

  return data;

}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com empresa e cnpj
  --------------------------------------------------------------------------------------
*/

const newCompanyItem = async () => {
  const inputCompanyCNPJ = document.getElementById("newCompanyCNPJ").value.trim();
  const inputCompanyName = document.getElementById("newCompanyName").value.trim();

  if (!inputCompanyCNPJ) {
    alert("Escreva o CNPJ da empresa!");
    return;
  }

  if (!inputCompanyName) {
    alert("Escreva o nome da empresa!");
    return;
  }

  console.log(inputCompanyCNPJ);
  console.log(inputCompanyName);

  try {
    await postCompany(inputCompanyCNPJ, inputCompanyName)
    insertCompanyList(inputCompanyCNPJ, inputCompanyName)
    alert("Item adicionado!")
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }

}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com invoice, descrição, valor e data de pagamento 
  --------------------------------------------------------------------------------------
*/

const addCompany = async () => {
  const cnpj  = document.getElementById("newCompanyCNPJ").value.trim();
  const name  = document.getElementById("newCompanyName").value.trim();

  if (!cnpj) {
    alert("Escreva o CNPJ da empresa!");
    return;
  }

  if (!name) {
    alert("Escreva o nome da empresa!");
    return;
  }

  try {
    await postCompany(cnpj, name);
    insertCompanyList(cnpj, name);
    alert("Empresa adicionada!");
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/

const insertCompanyList = (cnpj, name) => {
  var item = [cnpj, name];
  var table = document.getElementById('CompaniesTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }

  insertButton(row.insertCell(-1), 'company', { 
    CompanyCNPJ: cnpj 
  });

  document.getElementById("newCompanyCNPJ").value = "";
  document.getElementById("newCompanyName").value = "";

  removeElement()

};

/*
  --------------------------------------------------------------------------------------
  Tabela Procura Faturas
  --------------------------------------------------------------------------------------
*/

const getSearchInvoiceNumberCNPJ = async (number, cnpj) => {

  const params = new URLSearchParams({
    InvoiceNumber: number,
    InvoiceCompanyCNPJ: cnpj
  });

  const url = `http://localhost:5000/getInvoiceByNumber?${params.toString()}`;

  try {
    const response = await fetch(url, { method: 'GET' });

    // Try to get backend message no matter what:
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      // If backend sent a message, use it:
      const backendMessage = data?.message || `${response.status} ${response.statusText}`;
      throw new Error(backendMessage);
    }

    if (data.InvoiceNumber) {
      insertSearchInvoiceList(
        data.InvoiceNumber,
        data.InvoiceCompanyCNPJ,
        data.Value,
        data.PaymentDate
      );
    } else {
      console.warn('Resposta inesperada do backend:', data);
    }

  } catch (error) {
    console.error('Erro:', error);
    alert(`Erro: ${error.message}`);
  }
};

const getSearchInvoicesCNPJ = async (cnpj) => {
  const url = `http://localhost:5000/getInvoicesOfCnpj?InvoiceCompanyCNPJ=${encodeURIComponent(cnpj)}`;

  try {
    const response = await fetch(url, { method: 'GET' });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const backendMessage = data?.message || `${response.status} ${response.statusText}`;
      throw new Error(backendMessage);
    }

    if (Array.isArray(data.invoices)) {
      data.invoices.forEach(item => insertSearchInvoiceList(
        item.InvoiceNumber,
        item.InvoiceCompanyCNPJ,
        item.Value,
        item.PaymentDate
      ));
    } else {
      console.warn('Resposta inesperada do backend:', data);
    }
  } catch (error) {
    console.error('Erro:', error);
    alert(`Erro: ${error.message}`);
  }
};

const searchInvoiceItem = async (number, cnpj) => {

  const clearInvoicesSearchTable = () => {
    const table = document.getElementById('InvoicesSearchTable');
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }
  };

  clearInvoicesSearchTable();

  const inputInvoice = document.getElementById("SearchInvoiceNumber").value.trim();
  const inputInvoiceCNPJ = document.getElementById("SearchInvoiceCNPJ").value.trim();

  if (!inputInvoiceCNPJ) {
    alert("Escreva o CNPJ da empresa!");
    return;
  }

  // se número vazio procura todas as faturas da empresa

  if (!inputInvoice) {
    try {
      await getSearchInvoicesCNPJ(inputInvoiceCNPJ)
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
    return;
  }

  // se tiver número procura a fatura específica

  try {
    await getSearchInvoiceNumberCNPJ(inputInvoice, inputInvoiceCNPJ)
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }

}

const insertSearchInvoiceList = (invoice, invoice_cnpj, value, payment_date) => {
  var item = [invoice, invoice_cnpj, value, payment_date]
  var table = document.getElementById('InvoicesSearchTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }

  insertButton(row.insertCell(-1), 'invoice', { 
    InvoiceNumber: invoice,
    CompanyCNPJ: invoice_cnpj 
  });

  removeElement()

}

/*
  --------------------------------------------------------------------------------------
  Tabela Procura Empresas
  --------------------------------------------------------------------------------------
*/

const getSearchCompany = async (cnpj) => {
  const url = `http://localhost:5000/getCompany?CompanyCNPJ=${encodeURIComponent(cnpj)}`;

  try {
    const response = await fetch(url, { method: 'GET' });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const backendMessage = data?.message || `${response.status} ${response.statusText}`;
      throw new Error(backendMessage);
    }

    if (data.CompanyCNPJ) {
      insertSearchCompanyList(
        data.CompanyCNPJ,
        data.CompanyName
      );
    } else {
      console.warn('Resposta inesperada do backend:', data);
    }
  } catch (error) {
    console.error('Erro:', error);
    alert(`Erro: ${error.message}`);
  }
};

const searchCompanyItem = async (cnpj) => {

  const clearCompanySearchTable = () => {
    const table = document.getElementById('CompaniesSearchTable');
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }
  };

  clearCompanySearchTable();

  const inputCNPJ = document.getElementById("SearchCompanyCNPJ").value.trim();

  if (!inputCNPJ) {
    alert("Escreva o CNPJ da empresa!");
    return;
  }

  try {
    await getSearchCompany(inputCNPJ)
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }

}

const insertSearchCompanyList = (cnpj, name) => {
  var item = [cnpj, name]
  var table = document.getElementById('CompaniesSearchTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }
  insertButton(row.insertCell(-1), 'company', { 
    CompanyCNPJ: cnpj 
  });

  removeElement()

}


/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close para cada item da lista
  --------------------------------------------------------------------------------------
*/

const insertButton = (parent, type, idObj) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7");
  span.className = "close";

  span.dataset.type = type;
  span.dataset.id = JSON.stringify(idObj);

  span.appendChild(txt);
  parent.appendChild(span);
};

/*
  --------------------------------------------------------------------------------------
  Função para remover um item da lista de acordo com o click no botão close
  --------------------------------------------------------------------------------------
*/

const removeElement = () => {
  let closeButtons = document.getElementsByClassName("close");

  console.log('entrou')

  for (let i = 0; i < closeButtons.length; i++) {
    closeButtons[i].onclick = async function () {
      const row = this.parentElement.parentElement;
      const type = this.dataset.type;
      const idObj = JSON.parse(this.dataset.id);

      if (confirm("Você tem certeza que quer excluir?")) {
        try {
          await deleteItem(type, idObj);
          row.remove();
          alert("Removido!");
        } catch (error) {
          console.error('Erro ao excluir:', error);
          alert(`Erro ao excluir no servidor: ${error.message}`);
        }
      }
    };
  }
};

/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/

const deleteItem = async (type, idObj) => {

  let url = '';

  if (type === 'company') {
    url = `http://localhost:5000/deleteCompany?CompanyCNPJ=${encodeURIComponent(idObj.CompanyCNPJ)}`;
  } else if (type === 'invoice') {
    url = `http://localhost:5000/deleteInvoice?InvoiceNumber=${encodeURIComponent(idObj.InvoiceNumber)}&InvoiceCompanyCNPJ=${encodeURIComponent(idObj.CompanyCNPJ)}`;
  } else {
    throw new Error(`Tipo desconhecido: ${type}`);
  }

  const response = await fetch(url, { method: 'DELETE' });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const backendMessage = data?.message || `${response.status} ${response.statusText}`;
    throw new Error(backendMessage);
  }

  return await response.json();
};

/*
  --------------------------------------------------------------------------------------
  Garante formato correto para Valor na tabela de faturas
  --------------------------------------------------------------------------------------

*/

document.getElementById("newValue").addEventListener("input", function(e) {

  // remove valores não numéricos e zeros desnecassários
  let rawValue = this.value.replace(/\D/g, '').replace(/^0+/, '');

  // adiciona 0s para garantir mínimo 3 dígitos
  rawValue = rawValue.padStart(3, '0');

  // adiciona vírgula decimal
  this.value = 
    rawValue.slice(0, -2) + ',' + rawValue.slice(-2);


});

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/

getInvoicesList()
getCompaniesList()