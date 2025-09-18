import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const SENTIMENT_COLORS = {
  positive: "#10b981",
  negative: "#ef4444",
  neutral: "#6b7280",
};

const VADER_COLORS = {
  positive: "#ea580c",
  neutral: "#f97316",
  negative: "#fdba74",
};

const ENHANCED_SENTIMENT_COLORS = {
  positive: "#10b98120",
  negative: "#ef444420",
  neutral: "#6b728020",
};

const MODEL_DISPLAY_NAMES = {
  vader: "VADER",
  naive_bayes: "Naive Bayes",
  roberta: "RoBERTa",
};

const MODEL_DESCRIPTIONS = {
  vader: "Lexicon-based approach - Text composition analysis",
  naive_bayes: "Machine learning algorithm - Classification probability",
  roberta: "Deep learning model - Classification probability",
};

const PROBABILITY_COLORS = {
  "Naive Bayes": "#3b82f6",
  RoBERTa: "#8b5cf6",
};

const getSentimentColor = (sentiment) => SENTIMENT_COLORS[sentiment] || "#6b7280";
const formatScore = (score) => (score * 100).toFixed(1);
const getModelDisplayName = (modelKey) => MODEL_DISPLAY_NAMES[modelKey] || modelKey;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/60 rounded-lg p-3 shadow-lg">
      {label && <p className="text-gray-200 font-medium mb-2">{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {`${entry.name}: ${typeof entry.value === 'number' ? formatScore(entry.value) + '%' : entry.value}`}
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/60 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-gray-200">
        {`${payload[0].name}: ${payload[0].value} models`}
      </p>
    </div>
  );
};

const useProcessedData = (data) => {
  if (!data) return null;

  const vaderData = ["positive", "neutral", "negative"].map(sentiment => ({
    sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
    value: data.vader?.[sentiment] || 0,
    color: VADER_COLORS[sentiment],
  }));

  const probabilityData = ["positive", "neutral", "negative"].map(sentiment => ({
    sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
    "Naive Bayes": data.naive_bayes?.[sentiment] || 0,
    "RoBERTa": data.roberta?.[sentiment] || 0,
  }));

  const finalSentimentData = ["positive", "neutral", "negative"]
    .map(sentiment => ({
      name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
      value: data.conclusion?.[sentiment]?.length || 0,
      color: SENTIMENT_COLORS[sentiment],
    }))
    .filter(item => item.value > 0);

  return { vaderData, probabilityData, finalSentimentData };
};

const FinalResultCard = ({ data, finalSentimentData }) => (
  <Card className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/60 rounded-2xl shadow-lg">
    <CardHeader className="text-center">
      <CardTitle className="flex items-center justify-center gap-2 text-gray-200">
        Final Sentiment Analysis
        <Badge
          className="text-white font-semibold shadow-sm"
          style={{
            backgroundColor: getSentimentColor(data.conclusion?.final_sentiment),
          }}
        >
          {data.conclusion?.final_sentiment?.toUpperCase()}
        </Badge>
      </CardTitle>
      <CardDescription className="text-muted-foreground">
        Consensus from {Object.values(MODEL_DISPLAY_NAMES).length} models
      </CardDescription>
    </CardHeader>
    <CardContent>
      {finalSentimentData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={finalSentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {finalSentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardContent>
  </Card>
);

const CustomVaderTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/60 rounded-lg p-3 shadow-lg">
      {label && <p className="text-gray-200 font-medium mb-2">{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: "#f97316" }}>
          {`Proportion: ${typeof entry.value === 'number' ? formatScore(entry.value) + '%' : entry.value}`}
        </p>
      ))}
    </div>
  );
};

const VaderCompositionChart = ({ vaderData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-gray-200">VADER - Text Composition Analysis</CardTitle>
      <CardDescription className="text-muted-foreground">
        Proportion of positive, neutral, and negative sentiment in the text
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={vaderData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis 
              dataKey="sentiment" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomVaderTooltip />} cursor={false} />
            <Bar
              dataKey="value"
              fill={(entry) => entry.color}
              name="Proportion"
            >
              {vaderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const ProbabilityComparisonChart = ({ probabilityData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-gray-200">Classification Models - Probability Scores</CardTitle>
      <CardDescription className="text-muted-foreground">
        Likelihood that the entire text belongs to each sentiment category
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={probabilityData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis 
              dataKey="sentiment" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            {Object.entries(PROBABILITY_COLORS).map(([modelName, color]) => (
              <Bar
                key={modelName}
                dataKey={modelName}
                fill={color}
                name={modelName}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const ModelPerformanceRadar = ({ data }) => {
  const vaderRadarData = ["Positive", "Neutral", "Negative"].map(sentiment => ({
    sentiment,
    VADER: data.vader?.[sentiment.toLowerCase()] || 0,
  }));

  const probabilityRadarData = ["Positive", "Neutral", "Negative"].map(sentiment => ({
    sentiment,
    "Naive Bayes": data.naive_bayes?.[sentiment.toLowerCase()] || 0,
    "RoBERTa": data.roberta?.[sentiment.toLowerCase()] || 0,
  }));

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-200">VADER Analysis Pattern</CardTitle>
          <CardDescription className="text-muted-foreground">
            Text composition breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={vaderRadarData}>
                <PolarGrid strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="sentiment" stroke="#9ca3af" />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 1]} 
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="VADER"
                  dataKey="VADER"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-200">Classification Patterns</CardTitle>
          <CardDescription className="text-muted-foreground">
            Model confidence comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={probabilityRadarData}>
                <PolarGrid strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="sentiment" stroke="#9ca3af" />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 1]} 
                  tick={false}
                  axisLine={false}
                />
                {Object.entries(PROBABILITY_COLORS).map(([modelName, color]) => (
                  <Radar
                    key={modelName}
                    name={modelName}
                    dataKey={modelName}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.1}
                  />
                ))}
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ModelDetailCard = ({ modelKey, modelData }) => {
  const displayName = getModelDisplayName(modelKey);
  const description = MODEL_DESCRIPTIONS[modelKey];
  const isVader = modelKey === 'vader';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200">
          {displayName}
          {modelData?.sentiment && (
            <Badge
              style={{
                backgroundColor: getSentimentColor(modelData.sentiment),
              }}
              className="text-white"
            >
              {modelData.sentiment}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-gray-300">
        {modelData?.error ? (
          <p className="text-red-400">Error: {modelData.error}</p>
        ) : (
          <>
            <div className="text-xs text-gray-400 mb-3 font-medium">
              {isVader ? "Text Composition:" : "Classification Confidence:"}
            </div>
            {["positive", "neutral", "negative"].map(sentiment => (
              <div key={sentiment} className="flex justify-between">
                <span className={sentiment === "positive" ? "text-green-400" : 
                               sentiment === "negative" ? "text-red-400" : "text-gray-400"}>
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}:
                </span>
                <span>{formatScore(modelData?.[sentiment] || 0)}%</span>
              </div>
            ))}
            {modelData?.compound !== undefined && (
              <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span className="font-semibold text-gray-300">Compound Score:</span>
                <span
                  className={modelData.compound >= 0 ? "text-green-400" : "text-red-400"}
                >
                  {modelData.compound.toFixed(3)}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const ModelAgreementCard = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-gray-200">Model Agreement Analysis</CardTitle>
      <CardDescription className="text-muted-foreground">
        How the models voted on sentiment classification
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4">
        {["positive", "neutral", "negative"].map(sentiment => (
          <div
            key={sentiment}
            className="text-center p-4 rounded-lg"
            style={{ backgroundColor: ENHANCED_SENTIMENT_COLORS[sentiment] }}
          >
            <div
              className="text-2xl font-bold"
              style={{ color: SENTIMENT_COLORS[sentiment] }}
            >
              {data.conclusion?.[sentiment]?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Voted {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
            </div>
            {(data.conclusion?.[sentiment]?.length > 0) && (
              <div className="mt-2 flex flex-wrap gap-1 justify-center">
                {data.conclusion[sentiment].map((model, idx) => (
                  <Badge 
                    key={idx} 
                    className="text-xs bg-gray-700/80 text-gray-200 hover:bg-gray-700 border-gray-600"
                  >
                    {getModelDisplayName(model)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SentimentResults = ({ data }) => {
  const processedData = useProcessedData(data);
  
  if (!data || !processedData) return null;

  const { vaderData, probabilityData, finalSentimentData } = processedData;

  return (
    <div className="space-y-6 [&_.card]:bg-gray-900/40 [&_.card]:backdrop-blur-sm [&_.card]:border [&_.card]:border-gray-800/60 [&_.card]:rounded-2xl [&_.card]:shadow-lg">
      <FinalResultCard data={data} finalSentimentData={finalSentimentData} />
      
      <VaderCompositionChart vaderData={vaderData} />
      <ProbabilityComparisonChart probabilityData={probabilityData} />
      <ModelPerformanceRadar data={data} />
      
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(MODEL_DISPLAY_NAMES).map(([modelKey]) => (
          <ModelDetailCard 
            key={modelKey} 
            modelKey={modelKey} 
            modelData={data[modelKey]} 
          />
        ))}
      </div>

      <ModelAgreementCard data={data} />
    </div>
  );
};

export default SentimentResults;