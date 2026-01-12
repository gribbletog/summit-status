import React, { useState, useMemo } from 'react';
import WIPModal from './WIPModal';
import { isWIPSession, saveWIPOverride, hasWIPOverride, toggleWIPOverride, isWIPOverrideEnabled } from '../utils/wipStorage';
import { MASTER_PRODUCTS_LIST } from '../utils/productsList';
import './ProductsView.css';

const ProductsView = ({ sessions, showWIPData, wipCount, onToggleWIP, onWIPUpdate, showFilterOverlay, onCloseFilterOverlay }) => {
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [editingSession, setEditingSession] = useState(null);
  const [expandAll, setExpandAll] = useState(false);

  // Calculate product data - focusing on Hands-on Labs
  const productData = useMemo(() => {
    const products = {};
    
    sessions.forEach(session => {
      const productString = session['CFP: PRODUCTS'];
      const sessionType = session['DERIVED_SESSION_TYPE'];
      
      // Only include Hands-on Labs
      if (sessionType !== 'Hands-on Lab') return;
      if (!productString || productString.trim() === '') return;
      
      // Split products by comma and process each
      const productList = productString.split(',').map(p => p.trim()).filter(p => p !== '');
      
      productList.forEach(product => {
        if (!products[product]) {
          products[product] = {
            name: product,
            labs: [],
            totalLabs: 0
          };
        }
        
        products[product].labs.push(session);
        products[product].totalLabs++;
      });
    });
    
    return Object.values(products);
  }, [sessions]);

  // Sort products alphabetically
  const sortedProducts = useMemo(() => {
    return [...productData].sort((a, b) => a.name.localeCompare(b.name));
  }, [productData]);

  // Find products without labs
  const productsWithoutLabs = useMemo(() => {
    const productsWithLabs = new Set(productData.map(p => p.name));
    return MASTER_PRODUCTS_LIST.filter(product => !productsWithLabs.has(product)).sort();
  }, [productData]);

  const toggleProduct = (productName) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }));
  };

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleEditWIP = (session) => {
    setEditingSession(session);
  };

  const handleSaveWIP = (wipData) => {
    if (editingSession) {
      saveWIPOverride(editingSession['SESSION CODE'], wipData);
      setEditingSession(null);
      onWIPUpdate(); // Refresh data
    }
  };

  const handleCloseModal = () => {
    setEditingSession(null);
  };

  const handleToggleWIP = (sessionCode) => {
    toggleWIPOverride(sessionCode);
    onWIPUpdate(); // Refresh data
  };

  const handleExpandAll = () => {
    const newExpandAll = !expandAll;
    setExpandAll(newExpandAll);
    
    const newExpanded = {};
    sortedProducts.forEach(product => {
      newExpanded[product.name] = newExpandAll;
    });
    setExpandedProducts(newExpanded);
  };

  // Helper to clean duplicate company names
  const cleanCompanyName = (companyName) => {
    if (!companyName) return null;
    const parts = companyName.split(',').map(part => part.trim()).filter(part => part !== '');
    const uniqueParts = [...new Set(parts)];
    return uniqueParts.join(', ');
  };

  const renderLabCard = (lab, productName) => {
    const cardId = `${productName}-${lab['SESSION CODE']}`;
    const isExpanded = expandedCards[cardId];
    
    const title = lab['SESSION TITLE'] || 'Untitled';
    const description = lab['SESSION ABSTRACT'] || '';
    const sessionCode = lab['SESSION CODE'] || '';
    const track = lab['CFP: INTERNAL TRACK (SUMMIT)'] || '';
    const speakers = [];
    
    // Get speakers
    if (lab['SPEAKER (ASSIGNED TO SESSION TASKS) NAME']) {
      const name = lab['SPEAKER (ASSIGNED TO SESSION TASKS) NAME'];
      const company = cleanCompanyName(lab['SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY']);
      speakers.push({ name, company, type: 'Speaker' });
    }
    if (lab['SPEAKER NAME']) {
      const name = lab['SPEAKER NAME'];
      const company = cleanCompanyName(lab['SPEAKER COMPANY']);
      speakers.push({ name, company, type: 'Co-presenter' });
    }
    
    // Get all products for this lab
    const allProducts = [];
    if (lab['CFP: PRODUCTS']) {
      const productList = lab['CFP: PRODUCTS'].split(',').map(p => p.trim()).filter(p => p !== '');
      allProducts.push(...productList);
    }
    
    // Strip HTML for length check
    const plainDescription = description.replace(/<[^>]*>/g, '');
    const isLongContent = title.length > 80 || plainDescription.length > 200;
    
    const sessionIsWIP = isWIPSession(lab);
    const sessionHasWIPOverride = hasWIPOverride(lab['SESSION CODE']);
    const wipOverrideEnabled = sessionHasWIPOverride && isWIPOverrideEnabled(lab['SESSION CODE']);

    return (
      <div key={cardId} className={`product-lab-card ${isExpanded ? 'expanded' : ''} ${(sessionIsWIP || sessionHasWIPOverride) ? 'wip-card' : ''} ${sessionHasWIPOverride ? 'has-wip-override' : ''} ${sessionHasWIPOverride && !wipOverrideEnabled ? 'wip-disabled' : ''}`}>
        <div className="product-card-header">
          <div className="product-card-title-row">
            <h4 className="product-card-title">{title}</h4>
            {(sessionIsWIP || sessionHasWIPOverride) && (
              <span className="product-wip-badge" title={sessionHasWIPOverride ? (wipOverrideEnabled ? 'WIP Override Active' : 'WIP Override Disabled') : 'WIP Session'}>
                {sessionHasWIPOverride ? (wipOverrideEnabled ? '📝' : '📝❌') : '⚠️'}
              </span>
            )}
          </div>
          <div className="product-card-meta">
            <span className="product-card-code">{sessionCode}</span>
            {track && <span className="product-card-track">{track}</span>}
          </div>
        </div>
        
        <div 
          className="product-card-description"
          dangerouslySetInnerHTML={{ 
            __html: isExpanded ? description : plainDescription.substring(0, 200) + (plainDescription.length > 200 ? '...' : '')
          }}
        />
        
        {(allProducts.length > 0 || speakers.length > 0) && (
          <div className="product-card-info-columns">
            {allProducts.length > 1 && (
              <div className="product-card-products">
                <div className="product-card-info-label">All Products</div>
                {allProducts.map((product, idx) => (
                  <div key={idx} className="product-item">
                    {product}
                  </div>
                ))}
              </div>
            )}
            
            {speakers.length > 0 && (
              <div className="product-card-speakers">
                <div className="product-card-info-label">Speakers</div>
                {speakers.map((speaker, idx) => (
                  <div key={idx} className="product-card-speaker">
                    <span className="speaker-name">{speaker.name}</span>
                    {speaker.company && <span className="speaker-company">{speaker.company}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="product-card-actions">
          {isLongContent && (
            <button 
              className="product-card-more"
              onClick={() => toggleCard(cardId)}
            >
              {isExpanded ? 'Show less' : 'More...'}
            </button>
          )}
          {(sessionIsWIP || sessionHasWIPOverride) && (
            <>
              <button 
                className="product-card-edit-wip"
                onClick={() => handleEditWIP(lab)}
              >
                {sessionHasWIPOverride ? 'Edit WIP' : 'Add WIP'}
              </button>
              {sessionHasWIPOverride && (
                <button 
                  className={`product-card-toggle-wip ${wipOverrideEnabled ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleWIP(lab['SESSION CODE'])}
                  title={wipOverrideEnabled ? 'Hide WIP data (show CSV)' : 'Show WIP data'}
                >
                  {wipOverrideEnabled ? '👁️ WIP' : '👁️ CSV'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="products-view">
      {showFilterOverlay && (
        <div className="filter-overlay-backdrop" onClick={onCloseFilterOverlay}>
          <div className="filter-overlay-panel" onClick={(e) => e.stopPropagation()}>
            <button className="filter-overlay-close" onClick={onCloseFilterOverlay}>&times;</button>
            
            <div className="products-header">
              <div className="products-toggles">
                {wipCount > 0 && (
                  <label className="product-toggle wip-toggle">
                    <input
                      type="checkbox"
                      checked={showWIPData}
                      onChange={onToggleWIP}
                    />
                    <span>Show WIP Data ({wipCount})</span>
                  </label>
                )}
                
                <button 
                  className="expand-all-button"
                  onClick={handleExpandAll}
                >
                  {expandAll ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="products-list">
        {sortedProducts.map(product => {
          const isExpanded = expandedProducts[product.name];
          
          return (
            <div key={product.name} className="product-item">
              <div className="product-summary" onClick={() => toggleProduct(product.name)}>
                <span className="product-caret">{isExpanded ? '▼' : '▶'}</span>
                <span className="product-name">{product.name}</span>
                <div className="product-counts">
                  <span className="count-badge">{product.totalLabs} {product.totalLabs === 1 ? 'Lab' : 'Labs'}</span>
                </div>
              </div>
              
              {isExpanded && (
                <div className="product-details">
                  <div className="product-labs-grid">
                    {product.labs.map(lab => renderLabCard(lab, product.name))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {productsWithoutLabs.length > 0 && (
        <div className="products-without-labs">
          <h2 className="no-labs-title">
            Products Without Labs ({productsWithoutLabs.length})
          </h2>
          <div className="no-labs-grid">
            {productsWithoutLabs.map(product => (
              <div key={product} className="no-lab-item">
                {product}
              </div>
            ))}
          </div>
        </div>
      )}

      {editingSession && (
        <WIPModal
          session={editingSession}
          onSave={handleSaveWIP}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProductsView;
