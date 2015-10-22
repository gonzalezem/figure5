var r1 = 1200 / 2, 
    r0 = r1 - 300; 


var tooltip = d3.select("body")
  .append("div")
  .attr("x", "50")
  .attr("y", r0/2)
  .attr("id", "tooltip")
  .style("visibility", "hidden");

var chord = d3.layout.chord()
    .padding(0.12)  
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

var arc = d3.svg.arc()
    .innerRadius(r0 + 2)
    .outerRadius(r0 + 18);

var svg = d3.select("body").append("svg")
    .attr("width", r1 * 2)
    .attr("height", r1 * 2)
  .append("g")
    .attr("transform", "translate(" + r1 +"," + r1 + ")");

function fade(opacity) {
  return function(g, i) {
    svg.selectAll("g path.chord")
        .filter(function(d) {
          return d.source.index != i && d.target.index != i;
        })
      .transition()
        .style("opacity", opacity);
  };
}
  
function draw(companions) {
  var indexByName = {},
      speciesByIndex = {},
      CompanionsByIndex = {},
      AnnotationByIndex = {},
      SizeByIndex = {},
      nameByIndex = {},
      matrix = [],
      n = 0;

  var families= {},
      f = 0,
      indexInspecies = 0,
      speciesHue = 2,
      hueStep = 66;


  companions.forEach(function(d) {
    p = d.name;
    z= d.species;
    y = d.companions;
    x = d.size;
    w = d.annotation;
    console.log();
    if(!families[d.species] || !families[d.species].color) {
      f++;
      var hSaturation = (f % 2 !== 0)  ? 0.5 : 0.9;
      var hLightness  = (f % 3 !== 0)  ? 0.5 : 0.9;
      indexInspecies = 1;
      families[d.species] = {name: d.species,color: d3.hsl(speciesHue, hSaturation, hLightness)}; speciesHue+= hueStep;
    }
    else
    {
      indexInspecies++;
    }
    var baseColor = families[d.species].color;
    d.recolor = d3.rgb(baseColor); 

    if (!(d in indexByName)) {
      nameByIndex[n] = p;
      speciesByIndex[n] = z;
      CompanionsByIndex[n] = y;
      SizeByIndex[n] = x;
      indexByName[p] = n++;
    }
  });

  companions.forEach(function(d) {
    var source = indexByName[d.name],
        row = matrix[source];
    if (!row) {
     row = matrix[source] = [];
     for (var i = -1; ++i < n;) row[i] = 0;
    }
    d.companions.forEach(function(d) { row[indexByName[d]]++; });
  });

  chord.matrix(matrix);

  var g = svg.selectAll("g.group")
      .data(chord.groups)
    .enter().append("g")
      .attr("class", "group");

  g.append("path")
      .style("fill", function(d, i) { return companions[i].recolor; })
      .style("stroke", function(d, i) { return companions[i].recolor; })
      .style("stroke-width", 5)
      .attr("d", arc)
      .on("mouseover", fade(0.1))
      .on("mouseout", fade(1))
      .on("click", function(d) { 
        return tooltip.style("visibility", "visible")
                      .html("Name: <b><i>" + speciesByIndex[d.index] + "</b></i><br/>Mismapping #: <b>" + SizeByIndex[d.index])
                      .style("left", (1000) + "px")  
                      .style("top", (600) + "px"); });
      
  
  g.append("text")
      .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + (r0 + 26) + ")"
            + (d.angle > Math.PI ? "rotate(180)" : "");
      })
      .text(function(d) { return nameByIndex[d.index].substring(0, nameByIndex[d.index].lastIndexOf("|")); });

  svg.selectAll("path.chord")
      .data(chord.chords)
    .enter().append("path")
      .attr("class", "chord")
      .style("stroke", function(d, i) { return companions[d.target.index].recolor.darker(); })
      .style("fill", function(d, i) { return companions[d.target.index].recolor; })
      .attr("d", d3.svg.chord().radius(r0));

}

d3.json("Mismapping_5_species.json",draw);
