
/*variaveis globais
*	globalText = texto do arquivo .bib a ser gerado.
*	filename = nome do arquivo .bib a ser gerado.
*	json_artigos = json com dados do artigo e com a query do google scholar montada.
*	flag_isFirst & isDisabled = Variáveis de controle
*
*/
var globalText = "";
var filename = "";
var json_artigos = '{ "Articles": [';
var flag_isFirst = true;
var isDisabled = false;


/*
*	Função update()
*	Pré condição: variável globalText vazia ou com conteúdo do arquivo .bib incompleto.
*				  variável filename vazia ou incompleta.
*				  variável json_artigos vazio ou incompleto.
*				  
*	Pós condição: variável globalText com conteúdo do arquivo .bib atualizado ou finalizado.
*				  variável filename completa.
*				  variável json_artigos atualizado ou completo.
*
*	Justificativa: 
*			A funcao chega aos resultados esperados pois: No primeiro clique do botão update ela inclui os conteúdos de <form id="frm1">, que correspondem ao proceedings, e guarda 
*			na variavel globalText, e então concatena o conteudo de <form id="frm2"> em globalText, na formatacao correta. A cada clique subsequente do botão update, o conteudo de
*			<form id="frm2"> vai sendo concatenado em globalText.
*			
*			A variavel json_artigos começa com uma string vazia (""). A cada clique do botão update, a função concatena o conteudo de <form id="frm2"> na variavel, com a formatacao 
*			correta. Alem disso, a cada clique eh gerado o link da query do google scholar, utilizando o titulo do artigo e o sobrenome do primeiro autor.
*			
*			A variavel filename, é preenchida no primeiro clicar do botão update, concatenando a string "WER" com os dois ultimos numerais do campo <input type="text" name="year">.
*			Exemplo: year = 2018 => filename = "WER18"
*/
function update() {
    var x = document.getElementById("frm1");
    var text = "@proceedings{";
    var i;
	var temp = "";

	
	if (confirm("Confirmar dados?")) 
	{
		if(!isDisabled){
			for (i = 0; i < x.length ;i++) {
				if(x.elements[i].name == "year" && x.elements[i].value != ""){
					temp = x.elements[i].value;
					text = text + "WERpapers: WER" + temp.substring(2,4) + ", ";
					filename = "WER" + temp.substring(2,4);
					break;
				}
			}
			
			for (i = 0; i < x.length ;i++) {		
				if(x.elements[i].value != ""){
					if(x.elements[i].name != ""){
						if(i > 0){
							text += ', ' + x.elements[i].name + ' = {' + x.elements[i].value + '}';
						}
						else{
							text += x.elements[i].name + ' = {' + x.elements[i].value + '}';
						}		
					}
					else{
						if(i> 0){
							text += ', ' + x.elements[i].value;
						}
						else{
							text += x.elements[i].value;
						}
					}	
				}
				x.elements[i].disabled = true;
			}
			
			text+="}";
			isDisabled = true;
		}
		
		
		
		var y = document.getElementById("frm2");
		var text2 = "@article{";
		var query_scholar = "";
		json_artigos = json_artigos + '{';
		for (i = 0; i < y.length ;i++){
			if(y.elements[i].value != "" && y.elements[i].type == "text"){
					
				if(y.elements[i].name != ""){
					if(i > 0) text2 += ', ' + y.elements[i].name + ' = {' + y.elements[i].value + '}';
					else text2 += y.elements[i].name + ' = {' + y.elements[i].value + '}';
					
					if(i>1) json_artigos = json_artigos + ',"' + y.elements[i].name + '":"' + y.elements[i].value + '"';
					else json_artigos = json_artigos + '"' + y.elements[i].name + '":"' + y.elements[i].value + '"'; 
					
					if(y.elements[i].name.valueOf() == "author"){
						var autores = removerAcentos(y.elements[i].value);
						var autor_query = "";
						var posicao_inicio = 0;
						var ii = 0;
						for(ii = 0; ii < autores.length; ii++){
							if(autores[ii] == ','){
								posicao_inicio = ii;
								break;
							}
						}
						
						if(posicao_inicio > 0){
							for(ii = posicao_inicio - 1; ii > 0; ii--){
								if(autores[ii] == ' ' || autores[ii] == ',' ) break;		
								autor_query += autores[ii];
								
							}
						}else{
							for(ii = autores.length - 1; ii > 0; ii--){
								if(autores[ii] == ' ' || autores[ii] == ',' ) break;
								autor_query += autores[ii];
							}
						}
						autor_query = autor_query.split("").reverse().join("");
						query_scholar = autor_query + '%22&btnG=' + '"';
					}
					
					if(y.elements[i].name.valueOf() == "title"){
						query_scholar = ',"qscholar":"https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=%22' + y.elements[i].value + '%22+author%3A%22' + query_scholar;
						query_scholar = query_scholar.replace(/\s/g, "+");
						json_artigos = json_artigos + query_scholar;
					}
					
					
					
				}
				else{
					if(i> 0) text2 += ', ' + y.elements[i].value;
					else text2 += y.elements[i].value;
				}
						
			}
		}
		text2+= "}";
		
		json_artigos = json_artigos + '},';
		
		if(!flag_isFirst){
			globalText += " " + text2;
		}
		else{
			globalText += text + " " + text2;
			flag_isFirst = false;
		}
    } 
	globalText = removerAcentos(globalText);
	json_artigos = removerAcentos(json_artigos);
    document.getElementById("demo").innerHTML = globalText;
}

/*
*	Função writeFilesLocal()
*	Pré condição: variável globalText completamente preenchida
*				  
*	Pós condição: download do arquivo .bib completo.
*
*	Justificativa: 
*			O arquivo .bib eh gerado pois ele pega o conteudo da variavel globalText, atribui a uma variavel temporaria, e gera o download a partir dessa variavel.
*/

function writeFilesLocal() {
	if (confirm("Enviar arquivos?")) 
	{
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(globalText));
		element.setAttribute('download', filename + ".bib");

		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		
		window.location.reload()
	}
}

/*
*	Função generateJsonLocal()
*	Pré condição: variável json_artigos completamente preenchida
*				  
*	Pós condição: download do arquivo json completo, contendo os dados dos artigos e os respectivos links para as queries do google scholar.
*
*	Justificativa: 
*			O arquivo json, com o link da query do google scholar, eh gerado pois ele pega o conteudo da variavel json_artigos, atribui a uma variavel temporaria, 
*			e gera o download a partir dessa variavel.
*/

function generateJsonLocal() {
if (confirm("Gerar Json?")) 
	{
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json_artigos + ']}'));
		element.setAttribute('download', filename + ".txt");

		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		
		
	}
}

/*
*	Função removerAcentos()
*	Pré condição: string podendo conter ou não caracteres com acento.
*				  
*	Pós condição: string com caracteres sem acento.

	Justificativa:
				A funcao retorna uma copia da string passada como parametro pois substitui todos os caracteres da string passada como parametro, olha um a um e substitui qualquer
				caracter com acento pelo seu equivalente sem acento.

	Função desenvolvida por Mario Luan. Creditos: (https://gist.github.com/marioluan/6923123)
*/

function removerAcentos( newStringComAcento ) {
	
	/**
	 * Remove acentos de caracteres
	 * @param  {String} stringComAcento [string que contem os acentos]
	 * @return {String}                 [string sem acentos]
	 * Creditos: Mario Luan (https://gist.github.com/marioluan/6923123)
	 */
	
	var string = newStringComAcento;
	var mapaAcentosHex = {
			a : /[\xE0-\xE6]/g,
			A : /[\xC0-\xC6]/g,
			e : /[\xE8-\xEB]/g,
			E : /[\xC8-\xCB]/g,
			i : /[\xEC-\xEF]/g,
			I : /[\xCC-\xCF]/g,
			o : /[\xF2-\xF6]/g,
			O : /[\xD2-\xD6]/g,
			u : /[\xF9-\xFC]/g,
			U : /[\xD9-\xDC]/g,
			c : /\xE7/g,
			C : /\xC7/g,
			n : /\xF1/g,
			N : /\xD1/g,
	};

	for ( var letra in mapaAcentosHex ) {
		var expressaoRegular = mapaAcentosHex[letra];
		string = string.replace( expressaoRegular, letra );
	}

	return string;
}