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

    <xsl:template match="position">
        <xsl:copy>
            <!-- <xsl:value-of select="$klavesa"/> -->
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
    
    <!-- Update x coordinate -->    
    <xsl:template match="x">
        <xsl:copy>
            <xsl:choose>
                <xsl:when test="$klavesa = 'a'"><xsl:value-of select=". - 1"/></xsl:when>
                <xsl:when test="$klavesa = 'd'"><xsl:value-of select=". + 1"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="."/></xsl:otherwise>
            </xsl:choose>            
        </xsl:copy>
    </xsl:template> 
    
    <!-- Update y coordinate -->    
    <xsl:template match="y">
        <xsl:copy>
            <xsl:choose>
                <xsl:when test="$klavesa = 'w'"><xsl:value-of select=". + 1"/></xsl:when>
                <xsl:when test="$klavesa = 's'"><xsl:value-of select=". - 1"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="."/></xsl:otherwise>
            </xsl:choose>            
        </xsl:copy>
    </xsl:template> 
    
    <xsl:template match="@*|node()">
        <xsl:copy-of select="."/>
    </xsl:template>
</xsl:stylesheet>
