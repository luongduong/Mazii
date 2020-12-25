/* global api */
class envi_Cambridge {
  constructor(options) {
    this.options = options;
    this.maxexample = 2;
    this.word = "";
  }

  async displayName() {
    let locale = await api.locale();
    return "Cambridge EN->VI Dictionary";
  }

  setOptions(options) {
    this.options = options;
    this.maxexample = options.maxexample;
  }

  async findTerm(word) {
    this.word = word;
    return await this.findCambridge(word);
  }

  async findCambridge(word) {
    let notes = [];
    if (!word) return notes; // return empty notes

    function T(node) {
      if (!node) return "";
      else return node.innerText.trim();
    }

    let base =
      "https://dictionary.cambridge.org/dictionary/english-vietnamese/";
    let audioUrl = "https://dict.laban.vn/ajax/getsound?accent=us&word=" + word;
    let url = base + word;

    let doc = "",
      audios = [];
    try {
      const [data, audio] = await Promise.all([
        api.fetch(url),
        api.fetch(audioUrl)
      ]);

      let parser = new DOMParser();
      doc = parser.parseFromString(data, "text/html");
      //audio
      audios[0] = JSON.parse(audio).data;
    } catch (err) {
      return [];
    }

    let entries = doc.querySelectorAll(".english-vietnamese .kdic") || [];
    for (const entry of entries) {
      let definitions = [],
        samples = [];

      let expression = T(entry.querySelector(".di-title"));
      let reading = T(entry.querySelector(".pron-info .ipa"));
      let pos = T(entry.querySelector(".posgram"));
      pos = pos ? `<span class='pos'>${pos}</span>` : "";

      let defblocks = entry.querySelectorAll(".def-block") || [];
      // make definition segement
      for (const defblock of defblocks) {
        let indicator = T(defblock.querySelector(".def-head .indicator"));
        let eng_tran = T(defblock.querySelector(".def-head .def"));
        let vi_tran = T(defblock.querySelector(".def-body .trans"));
        if (!eng_tran || !vi_tran) continue;
        let definition = "",
          sample = "";
        eng_tran = `<div class='eng_tran'>${indicator} ${eng_tran}</div>`;
        vi_tran = `<div class='vi_tran'>${vi_tran}</div>`;
        let tran = `<span class='tran'>${eng_tran}${vi_tran}</span>`;
        definition += `${pos}${tran}`;

        // make exmaple segement
        let examps = defblock.querySelectorAll(".def-body .examp") || [];
        if (examps.length > 0 && this.maxexample > 0) {
          sample = definition;
          sample += '<ul class="sents">';
          for (const [index, examp] of examps.entries()) {
            if (index > this.maxexample - 1) break; // to control only 2 example sentence.
            let eng_examp = T(examp.querySelector(".eg"));
            let vi_examp = T(examp.querySelector(".trans"));
            sample += `<li class='sent'><span class='eng_sent'>${eng_examp}</span><span class='vi_sent'>${vi_examp}</span></li>`;
          }
          sample += "</ul>";
        }
        definitions.push(definition);
        samples.push(sample);
      }
      if (definitions.length > 0) {
        let css = this.renderCSS();
        notes.push({
          css,
          expression,
          reading,
          definitions: samples,
          audios
        });
      }
    }
    return notes;
  }

  renderCSS() {
    let css = `
            <style>
                div.phrasehead{margin: 2px 0;font-weight: bold;}
                span.pos  {text-transform:lowercase; font-size:0.9em; margin-right:5px; padding:2px 4px; color:white; background-color:#0d47a1; border-radius:3px;}
                span.tran {margin:0; padding:0;}
                div.eng_tran {margin-right:3px; padding:0;}
                div.vi_tran {font-weight:bold; color:#0d47a1;}
                ul.sents {font-size:0.9em; list-style:square inside; margin:3px 0;padding:5px;background:rgba(13,71,161,0.1); border-radius:5px;}
                li.sent  {margin:0; padding:0;}
                span.eng_sent {margin-right:5px;}
                span.vi_sent {color:#0d47a1;}
            </style>`;
    return css;
  }
}
