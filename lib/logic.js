/**
 * Registra os boletos nos bancos
 * @param {org.boleto.cto.RegistroBoleto} registroBoleto - Transação com o Boleto que será emitido por bancoemissor/IFBeneficario
 * @transaction
 */
function registrarBoleto(registroBoleto) {
    var boleto = registroBoleto.boleto;
    
    if (boleto.boletoId == '') {
      throw new Error('Não existe Boleto');
    }
   
    boleto.codigoBarra= (Math.random() * Date.now()*10000000).toString()+(Math.random() * Date.now()*10000000).toString()+"000000"; 
    var dias = 3;
    boleto.dataVencimento = new Date(Date.now() + dias*24*60*60*1000).toLocaleString();
    boleto.status = "PENDENTE";
    
    boleto.beneficiario = registroBoleto.beneficiario;
    boleto.pagador = registroBoleto.pagador;
  
    console.log('###Registrar Boleto ID ' + boleto.boletoId.toString());
    
    return getAssetRegistry('org.boleto.cto.Boleto')
      .then(function(boletoRegistry) {
      return boletoRegistry.update(boleto);
    });
  }
  
/**
 * Efetua o pagamento de um boleto
 * @param {org.boleto.cto.PagamentoBoleto} pagamentoBoleto - Transação com o Boleto que será pago
 * @transaction
 */
async function pagarBoleto(pagamentoBoleto) {
    // identificador do boleto
    const _boletoId = registroBoleto.boletoId;
    const _pagador = registroBoleto.pagador

    // recuperar o boleto
    const boletoRegistry = await getAssetRegistry('org.boleto.cto.Boleto');
    const boleto = await boletoRegistry.get(_boletoId);

    // consiste boleto nao encontrado
    if( !boleto ){
        throw new Error('Boleto não registrado');       
    }

    // consiste boleto ja pago
    if( boleto.status == 'PAGO' ){
        throw new Error('Boleto ja foi pago');       
    }

    // recuperar o pagador
    const pagadorRegistry = await getParticipantRegistry('org.boleto.cto.Pessoa');
    const pagador = await pagadorRegistry.get(_pagador.getIdentity());

    // consiste boleto registrado para outro pagador
    if( _pagador.pessoaId != pagador.pessoaId ){
        throw new Error('Boleto registrado para outro pagador');       
    }

    // alterar estado boleto
    boleto.status = 'PAGO';

    // persiste novas informacoes
    await boletoRegistry.update(boleto);
}