async function createIpb201w({ idToken, cmpName, insNo, userType }) {
    const serverData = await sendMessageAsync("ipb201w/convenant", idToken, { cmpName, insNo, userType });
    const data = serverData.data;
    const content = data.content;
    const tableMemo = content.map(item => ({ fromTable: item.fromTable, tableId: item.tableId }));
    const insurance = content[0];

    return Object.freeze({
        prodCode: insurance?.prodCode?.trim() || null,
        askName: insurance?.askName?.trim() || null,
        name: insurance?.name?.trim() || null,
        tableMemo: tableMemo,
        fromTable: insurance?.fromTable || null,
        tableId: insurance?.tableId || null
    });
}

async function createIpb202w({ idToken, cmpName, insNo, userType, fromTable, tableId }) {
    const serverData = await sendMessageAsync("ipb202w", idToken, { cmpName, insNo, userType, fromTable, tableId });
    const insurance = serverData.data;

    return Object.freeze({
        prodCode: insurance?.prodCode?.trim() || null,
        askName: insurance?.askName?.trim() || null,
        name: insurance?.name?.trim() || null
    });
}
