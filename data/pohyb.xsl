<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="xml" indent="yes" encoding="UTF-8"/>
    <xsl:strip-space elements="*"/>

    <!-- Standard Identity transform: copies everything as-is, allowing indent="yes" to work recursively -->
    <xsl:template match="player">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>

    <!-- Load the current key press from akce.xml -->
    <xsl:variable name="klavesa" select="document('akce.xml')/akce/stisk/@klavesa"/>
    
    <!-- Check if player is dead -->
    <xsl:variable name="isDead" select="/player/stats/health &lt;= 0"/>

    <xsl:template match="position">
        <xsl:copy>
            <!-- <xsl:value-of select="$klavesa"/> -->
            <xsl:apply-templates select="node()"/>
        </xsl:copy>
    </xsl:template>

    <xsl:variable name="minX" select="0"/>
<xsl:variable name="maxX" select="29"/>
<xsl:variable name="minY" select="0"/>
<xsl:variable name="maxY" select="20"/>
    
    <!-- Update x coordinate -->    
  <xsl:template match="x">
    <xsl:variable name="novyX">
        <xsl:choose>
            <xsl:when test="$isDead or $klavesa = 'reset'">
                <xsl:value-of select="15"/>
            </xsl:when>
            <xsl:when test="$klavesa = 'a'"> 
                <xsl:value-of select=". - 1"/>
            </xsl:when>
            <xsl:when test="$klavesa = 'd'">
                <xsl:value-of select=". + 1"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="."/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

<xsl:variable name="ohraniceneX">
    <xsl:choose>
        <xsl:when test="$novyX &lt; $minX">
            <xsl:value-of select="$minX"/>
        </xsl:when>
        <xsl:when test="$novyX &gt; $maxX">
            <xsl:value-of select="$maxX"/>
        </xsl:when>
        <xsl:otherwise>
            <xsl:value-of select="$novyX"/>
        </xsl:otherwise>
    </xsl:choose>
</xsl:variable>


    <xsl:copy>
        <xsl:value-of select="$ohraniceneX"/>
    </xsl:copy>
</xsl:template>
    
 
   
 <xsl:template match="y">
    <xsl:variable name="novyY">
        <xsl:choose>
            <xsl:when test="$isDead or $klavesa = 'reset'">
                <xsl:value-of select="19"/>
            </xsl:when>
            <xsl:when test="$klavesa = 'w'">
                <xsl:value-of select=". - 1"/>
            </xsl:when>
            <xsl:when test="$klavesa = 's'">
                <xsl:value-of select=". + 1"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="."/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

  <xsl:variable name="ohraniceneY">
    <xsl:choose>
        <xsl:when test="$novyY &lt; $minY">
            <xsl:value-of select="$minY"/>
        </xsl:when>
        <xsl:when test="$novyY &gt; $maxY">
            <xsl:value-of select="$maxY"/>
        </xsl:when>
        <xsl:otherwise>
            <xsl:value-of select="$novyY"/>
        </xsl:otherwise>
    </xsl:choose>
</xsl:variable>
    <xsl:copy>
        <xsl:value-of select="$ohraniceneY"/>
    </xsl:copy>
</xsl:template>

    <!-- Recursive template to get item from CSV by index (0-based) -->
    <xsl:template name="get-tile-at">
        <xsl:param name="csv"/>
        <xsl:param name="targetIndex"/>
        <xsl:param name="currentIndex" select="0"/>
        
        <xsl:choose>
            <xsl:when test="$currentIndex = $targetIndex">
                <xsl:choose>
                    <xsl:when test="contains($csv, ',')">
                        <xsl:value-of select="normalize-space(substring-before($csv, ','))"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="normalize-space($csv)"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="get-tile-at">
                    <xsl:with-param name="csv" select="substring-after($csv, ',')"/>
                    <xsl:with-param name="targetIndex" select="$targetIndex"/>
                    <xsl:with-param name="currentIndex" select="$currentIndex + 1"/>
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="health">
        <!-- Calculate what the new coordinates WILL be to check for traps -->
        <xsl:variable name="currX" select="../../position/x"/>
        <xsl:variable name="currY" select="../../position/y"/>
        
        <xsl:variable name="prelimX">
            <xsl:choose>
                <xsl:when test="$klavesa = 'a'"><xsl:value-of select="$currX - 1"/></xsl:when>
                <xsl:when test="$klavesa = 'd'"><xsl:value-of select="$currX + 1"/></xsl:when>
                <xsl:when test="$klavesa = 'reset'">15</xsl:when>
                <xsl:otherwise><xsl:value-of select="$currX"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="prelimY">
            <xsl:choose>
                <xsl:when test="$klavesa = 'w'"><xsl:value-of select="$currY - 1"/></xsl:when>
                <xsl:when test="$klavesa = 's'"><xsl:value-of select="$currY + 1"/></xsl:when>
                <xsl:when test="$klavesa = 'reset'">19</xsl:when>
                <xsl:otherwise><xsl:value-of select="$currY"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <!-- Boundary check for trap detection logic -->
        <xsl:variable name="newX">
            <xsl:choose>
                <xsl:when test="$prelimX &lt; $minX"><xsl:value-of select="$minX"/></xsl:when>
                <xsl:when test="$prelimX &gt; $maxX"><xsl:value-of select="$maxX"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="$prelimX"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="newY">
            <xsl:choose>
                <xsl:when test="$prelimY &lt; $minY"><xsl:value-of select="$minY"/></xsl:when>
                <xsl:when test="$prelimY &gt; $maxY"><xsl:value-of select="$maxY"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="$prelimY"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <!-- Get trap layer data -->
        <xsl:variable name="trapCsv" select="document('mapa.xml')//layer[@name='trap']/data"/>
        <xsl:variable name="tileIndex" select="($newY * 30) + $newX"/>
        
        <xsl:variable name="tileId">
            <xsl:call-template name="get-tile-at">
                <xsl:with-param name="csv" select="$trapCsv"/>
                <xsl:with-param name="targetIndex" select="$tileIndex"/>
            </xsl:call-template>
        </xsl:variable>

        <xsl:copy>
            <xsl:choose>
                <xsl:when test="$isDead">
                    <xsl:value-of select="100"/>
                </xsl:when>
                <xsl:when test="$tileId = '266'">
                    <xsl:variable name="hp" select=". - 25"/>
                    <xsl:choose>
                        <xsl:when test="$hp &lt; 0">0</xsl:when>
                        <xsl:otherwise><xsl:value-of select="$hp"/></xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="."/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>